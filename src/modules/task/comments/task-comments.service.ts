import { BadRequestException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Task } from '../task.model'
import { TaskComment } from './task-comment.model'
import { Users } from '../../users/users.model'
import { BoardColumn } from '../../boardColumn/boardColumn.model'
import { CreateTaskCommentDto } from './dto/create-task-comment.dto'
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto'
import { TaskCommentMention } from './task-comment-mention.model'
import { ListTaskMentionsDto } from './dto/list-task-mentions.dto'
import { WebsocketService } from 'src/common/socket/websocket.service'
import { WS_EVENTS } from 'src/websocket/websocket.events'
import { NotificationsService } from '../../notifications/notifications.service'

export type TaskCommentTree = {
  id: number
  taskId: number
  parentCommentId?: number
  content: string
  tenantId: number
  createdBy: number
  createdAt?: Date
  updatedAt?: Date
  isDeleted?: boolean
  deletedAt?: Date
  author?: {
    id: number
    name: string
    lastName: string
    email: string
  }
  mentions?: Array<{
    id: number
    mentionedUserId: number
    isRead: boolean
    readAt?: Date
    mentionedUser?: {
      id: number
      name: string
      lastName: string
      email: string
    }
  }>
  replies: TaskCommentTree[]
}

export type MyMentionItem = {
  id: number
  commentId: number
  mentionedUserId: number
  mentionedByUserId: number
  tenantId: number
  isRead: boolean
  readAt?: Date
  createdAt?: Date
  comment?: {
    id: number
    taskId: number
    content: string
    author?: {
      id: number
      name: string
      lastName: string
      email: string
    }
    task?: {
      id: number
      name: string
    }
  }
}

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectModel(Task) private readonly taskModel: typeof Task,
    @InjectModel(TaskComment) private readonly taskCommentModel: typeof TaskComment,
    @InjectModel(TaskCommentMention) private readonly taskCommentMentionModel: typeof TaskCommentMention,
    @InjectModel(BoardColumn) private readonly boardColumnModel: typeof BoardColumn,
    @InjectModel(Users) private readonly usersModel: typeof Users,
    private readonly websocketService: WebsocketService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private isUserInTenant(user: Users, tenantId: number): boolean {
    return user.isAdmin ? user.id === tenantId : user.createdByAdminId === tenantId
  }

  private async validateMentionedUsers(mentionedUserIds: number[] | undefined, tenantId: number): Promise<number[]> {
    if (!mentionedUserIds?.length) return []

    const uniqueIds = [...new Set(mentionedUserIds)]
    const users = await this.usersModel.findAll({ where: { id: uniqueIds } })

    if (users.length !== uniqueIds.length) {
      throw new NotFoundException('Algunos usuarios mencionados no existen')
    }

    for (const user of users) {
      if (!this.isUserInTenant(user, tenantId)) {
        throw new BadRequestException('No puedes mencionar usuarios fuera de tu tenant')
      }
    }

    return uniqueIds
  }

  private async syncMentions(
    commentId: number,
    mentionedUserIds: number[] | undefined,
    tenantId: number,
    mentionedByUserId: number,
    notificationData?: {
      taskId?: number
      taskName?: string
      commentContent?: string
      boardId?: number
    },
  ): Promise<void> {
    if (!mentionedUserIds) return

    const validMentionedUserIds = await this.validateMentionedUsers(mentionedUserIds, tenantId)
    const filteredMentionedUserIds = validMentionedUserIds.filter(id => id !== mentionedByUserId)

    const existingMentions = await this.taskCommentMentionModel.findAll({
      where: { commentId, tenantId },
    })

    const existingUserIds = new Set(existingMentions.map(item => item.mentionedUserId))
    const nextUserIds = new Set(filteredMentionedUserIds)

    const toDelete = existingMentions
      .filter(item => !nextUserIds.has(item.mentionedUserId))
      .map(item => item.id)

    if (toDelete.length > 0) {
      await this.taskCommentMentionModel.destroy({ where: { id: toDelete } })
    }

    const toCreate = filteredMentionedUserIds
      .filter(userId => !existingUserIds.has(userId))
      .map(userId => ({
        commentId,
        mentionedUserId: userId,
        mentionedByUserId,
        tenantId,
        isRead: false,
      }))

    if (toCreate.length > 0) {
      const createdMentions = await this.taskCommentMentionModel.bulkCreate(toCreate as any[])
      for (const mention of createdMentions) {
        this.websocketService.emitToUser(mention.mentionedUserId, WS_EVENTS.TASK_MENTION_CREATED, {
          mentionId: mention.id,
          commentId,
          mentionedByUserId,
          createdAt: mention.createdAt,
        })

        await this.notificationsService.createForUser({
          userId: mention.mentionedUserId,
          tenantId,
          type: 'mention',
          title: 'Te mencionaron en un comentario',
          message: notificationData?.commentContent || 'Revisa la actividad reciente de tu tarea en Kanban.',
          createdByUserId: mentionedByUserId,
          data: {
            mentionId: mention.id,
            commentId,
            taskId: notificationData?.taskId,
            taskName: notificationData?.taskName,
            commentContent: notificationData?.commentContent,
            boardId: notificationData?.boardId,
          },
        })
      }
    }
  }

  private getCommentIncludes() {
    return [
      {
        model: Users,
        as: 'author',
        attributes: ['id', 'name', 'lastName', 'email'],
      },
      {
        model: TaskCommentMention,
        as: 'mentions',
        attributes: ['id', 'mentionedUserId', 'isRead', 'readAt'],
        required: false,
        include: [
          {
            model: Users,
            as: 'mentionedUser',
            attributes: ['id', 'name', 'lastName', 'email'],
          },
        ],
      },
    ]
  }

  private async resolveBoardIdForTask(task: Task): Promise<number | undefined> {
    const column = await this.boardColumnModel.findByPk(task.boardColumnId)

    return column?.boardId
  }

  private async ensureTaskInTenant(taskId: number, tenantId: number): Promise<Task> {
    const task = await this.taskModel.findByPk(taskId)
    if (!task || task.tenantId !== tenantId) {
      throw new NotFoundException('Tarea no encontrada')
    }
    return task
  }

  private async findCommentById(commentId: number, tenantId: number): Promise<TaskComment> {
    const comment = await this.taskCommentModel.findByPk(commentId)
    if (!comment || comment.tenantId !== tenantId) {
      throw new NotFoundException('Comentario no encontrado')
    }
    return comment
  }

  async createComment(taskId: number, dto: CreateTaskCommentDto, tenantId: number, createdBy: number): Promise<TaskComment> {
    const task = await this.ensureTaskInTenant(taskId, tenantId)

    if (dto.parentCommentId) {
      const parentComment = await this.findCommentById(dto.parentCommentId, tenantId)
      if (parentComment.taskId !== taskId) {
        throw new BadRequestException('La respuesta no pertenece a esta tarea')
      }
    }

    const comment = await this.taskCommentModel.create({
      taskId,
      parentCommentId: dto.parentCommentId,
      content: dto.content.trim(),
      tenantId,
      createdBy,
    } as any)

    await this.syncMentions(comment.id, dto.mentionedUserIds, tenantId, createdBy, {
      taskId,
      taskName: task.name,
      commentContent: dto.content.trim(),
      boardId: await this.resolveBoardIdForTask(task),
    })

    await comment.reload({
      include: this.getCommentIncludes(),
    })

    return comment
  }

  async createReply(commentId: number, dto: CreateTaskCommentDto, tenantId: number, createdBy: number): Promise<TaskComment> {
    const parentComment = await this.findCommentById(commentId, tenantId)
    return this.createComment(parentComment.taskId, { ...dto, parentCommentId: commentId }, tenantId, createdBy)
  }

  async findCommentsByTask(taskId: number, tenantId: number): Promise<TaskCommentTree[]> {
    await this.ensureTaskInTenant(taskId, tenantId)

    const comments = await this.taskCommentModel.findAll({
      where: { taskId, tenantId },
      order: [['createdAt', 'ASC'], ['id', 'ASC']],
      include: this.getCommentIncludes(),
    })

    const commentsMap = new Map<number, TaskCommentTree>()
    comments.forEach(comment => {
      const raw = comment.toJSON() as TaskCommentTree
      commentsMap.set(comment.id, {
        ...raw,
        content: raw.isDeleted ? 'Comentario eliminado' : raw.content,
        replies: [],
      })
    })

    const rootComments: TaskCommentTree[] = []
    commentsMap.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentsMap.get(comment.parentCommentId)
        if (parent) {
          parent.replies.push(comment)
          return
        }
      }
      rootComments.push(comment)
    })

    return rootComments
  }

  async updateComment(commentId: number, dto: UpdateTaskCommentDto, tenantId: number, userId: number): Promise<TaskComment> {
    const comment = await this.findCommentById(commentId, tenantId)
    if (comment.createdBy !== userId) {
      throw new ForbiddenException('No tienes permisos para editar este comentario')
    }

    if (comment.isDeleted) {
      throw new BadRequestException('No puedes editar un comentario eliminado')
    }

    await comment.update({ content: dto.content.trim() } as any)

    const task = await this.ensureTaskInTenant(comment.taskId, tenantId)
    await this.syncMentions(comment.id, dto.mentionedUserIds, tenantId, userId, {
      taskId: comment.taskId,
      taskName: task.name,
      commentContent: dto.content.trim(),
      boardId: await this.resolveBoardIdForTask(task),
    })
    await comment.reload({
      include: this.getCommentIncludes(),
    })

    return comment
  }

  async removeComment(commentId: number, tenantId: number, userId: number): Promise<void> {
    const comment = await this.findCommentById(commentId, tenantId)
    if (comment.createdBy !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este comentario')
    }

    if (comment.isDeleted) {
      return
    }

    await comment.update({ isDeleted: true, deletedAt: new Date(), deletedBy: userId } as any)
  }

  async findMyMentions(userId: number, tenantId: number, dto: ListTaskMentionsDto): Promise<MyMentionItem[]> {
    const where: Record<string, any> = {
      mentionedUserId: userId,
      tenantId,
    }

    if (dto.status === 'read') where.isRead = true
    if (dto.status === 'unread') where.isRead = false

    return this.taskCommentMentionModel.findAll({
      where,
      order: [['isRead', 'ASC'], ['createdAt', 'DESC']],
      include: [
        {
          model: TaskComment,
          as: 'comment',
          attributes: ['id', 'taskId', 'content'],
          include: [
            {
              model: Users,
              as: 'author',
              attributes: ['id', 'name', 'lastName', 'email'],
            },
            {
              model: Task,
              as: 'task',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    }) as unknown as MyMentionItem[]
  }

  async markMentionAsRead(mentionId: number, userId: number, tenantId: number): Promise<TaskCommentMention> {
    const mention = await this.taskCommentMentionModel.findByPk(mentionId)
    if (!mention || mention.tenantId !== tenantId || mention.mentionedUserId !== userId) {
      throw new NotFoundException('Mencion no encontrada')
    }

    await mention.update({ isRead: true, readAt: mention.readAt || new Date() } as any)
    return mention
  }

  async markAllMentionsAsRead(userId: number, tenantId: number): Promise<{ updated: number }> {
    const [updated] = await this.taskCommentMentionModel.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          mentionedUserId: userId,
          tenantId,
          isRead: false,
        },
      },
    )

    return { updated }
  }
}
