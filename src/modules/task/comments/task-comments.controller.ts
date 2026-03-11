import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { Auth } from '../../auth/decorators/auth.decorator'
import { GetUser } from '../../auth/decorators/get-user.decorator'
import { Users } from '../../users/users.model'
import { CreateTaskCommentDto } from './dto/create-task-comment.dto'
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto'
import { TaskCommentsService } from './task-comments.service'
import { ListTaskMentionsDto } from './dto/list-task-mentions.dto'

@Controller()
export class TaskCommentsController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  private resolveTenantId(user: Users): number {
    return user.isAdmin ? user.id : user.createdByAdminId
  }

  @Post('tasks/:taskId/comments')
  @Auth()
  createComment(@Param('taskId') taskId: string, @Body() dto: CreateTaskCommentDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskCommentsService.createComment(+taskId, dto, tenantId, user.id)
  }

  @Get('tasks/:taskId/comments')
  @Auth()
  findTaskComments(@Param('taskId') taskId: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskCommentsService.findCommentsByTask(+taskId, tenantId)
  }

  @Post('comments/:commentId/replies')
  @Auth()
  createReply(@Param('commentId') commentId: string, @Body() dto: CreateTaskCommentDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskCommentsService.createReply(+commentId, dto, tenantId, user.id)
  }

  @Put('comments/:commentId')
  @Auth()
  updateComment(@Param('commentId') commentId: string, @Body() dto: UpdateTaskCommentDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskCommentsService.updateComment(+commentId, dto, tenantId, user.id)
  }

  @Delete('comments/:commentId')
  @Auth()
  removeComment(@Param('commentId') commentId: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskCommentsService.removeComment(+commentId, tenantId, user.id)
  }

  @Get('comments/mentions/me')
  @Auth()
  findMyMentions(@Query() query: ListTaskMentionsDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskCommentsService.findMyMentions(user.id, tenantId, query)
  }

  @Put('comments/mentions/:mentionId/read')
  @Auth()
  markMentionAsRead(@Param('mentionId') mentionId: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskCommentsService.markMentionAsRead(+mentionId, user.id, tenantId)
  }

  @Put('comments/mentions/me/read-all')
  @Auth()
  markAllMentionsAsRead(@GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskCommentsService.markAllMentionsAsRead(user.id, tenantId)
  }
}
