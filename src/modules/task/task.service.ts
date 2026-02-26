import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Task } from './task.model'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { MoveTaskDto } from './dto/move-task.dto'
import { AssignTaskDto } from './dto/assign-task.dto'
import { BoardColumn } from '../boardColumn/boardColumn.model'
import { Users } from '../users/users.model'

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task) private readonly taskModel: typeof Task,
    @InjectModel(BoardColumn) private readonly boardColumnModel: typeof BoardColumn,
    @InjectModel(Users) private readonly usersModel: typeof Users
  ) {}

  async create(dto: CreateTaskDto, tenantId: number, createdBy: number): Promise<Task> {
    const column = await this.boardColumnModel.findByPk(dto.boardColumnId)
    if (!column || column.tenantId !== tenantId) {
      throw new NotFoundException('Columna no encontrada')
    }
    const task = await this.taskModel.create({ ...dto, tenantId, createdBy } as any)
    await task.reload({
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    return task
  }

  async findByColumn(boardColumnId: number, tenantId: number): Promise<Task[]> {
    const column = await this.boardColumnModel.findByPk(boardColumnId)
    if (!column || column.tenantId !== tenantId) {
      throw new NotFoundException('Columna no encontrada')
    }
    return this.taskModel.findAll({ 
      where: { boardColumnId, tenantId }, 
      order: [['position', 'ASC']],
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
  }

  async findOne(id: number, tenantId: number): Promise<Task> {
    const task = await this.taskModel.findByPk(id, {
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    if (!task) {
      throw new NotFoundException('Tarea no encontrada')
    }
    if (task.tenantId !== tenantId) {
      throw new NotFoundException('Tarea no encontrada')
    }
    return task
  }

  async update(id: number, dto: UpdateTaskDto, tenantId: number): Promise<Task> {
    const task = await this.findOne(id, tenantId)
    await task.update(dto as any)
    await task.reload({
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    return task
  }

  async remove(id: number, tenantId: number): Promise<void> {
    const task = await this.findOne(id, tenantId)
    await task.destroy()
  }

  async move(id: number, dto: MoveTaskDto, tenantId: number): Promise<Task> {
    const task = await this.findOne(id, tenantId)
    const column = await this.boardColumnModel.findByPk(dto.boardColumnId)
    if (!column || column.tenantId !== tenantId) {
      throw new NotFoundException('Columna no encontrada')
    }
    await task.update({ boardColumnId: dto.boardColumnId, position: dto.position } as any)
    await task.reload({
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    return task
  }

  async assign(id: number, dto: AssignTaskDto, tenantId: number): Promise<Task> {
    const task = await this.findOne(id, tenantId)

    if (dto.assignedUserId) {
      const assignee = await this.usersModel.findByPk(dto.assignedUserId)
      if (!assignee) {
        throw new NotFoundException('Usuario asignado no encontrado')
      }

      const isSameTenant = assignee.isAdmin
        ? assignee.id === tenantId
        : assignee.createdByAdminId === tenantId

      if (!isSameTenant) {
        throw new NotFoundException('Usuario asignado no encontrado')
      }
    }

    await task.update({ assignedUserId: dto.assignedUserId } as any)
    await task.reload({
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    return task
  }
}
