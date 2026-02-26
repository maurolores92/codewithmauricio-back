import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { TaskService } from './task.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { MoveTaskDto } from './dto/move-task.dto'
import { AssignTaskDto } from './dto/assign-task.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { ValidRoles } from '../auth/interfaces/valid-roles'
import { GetUser } from '../auth/decorators/get-user.decorator'
import { Users } from '../users/users.model'

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  private resolveTenantId(user: Users): number {
    const tenantId = user.isAdmin ? user.id : user.createdByAdminId
    console.log('[TaskController] Resolved tenantId:', {
      userId: user.id,
      isAdmin: user.isAdmin,
      createdByAdminId: user.createdByAdminId,
      resolvedTenantId: tenantId
    })
    return tenantId
  }

  @Post('columns/:columnId/tasks')
  @Auth()
  create(@Param('columnId') columnId: string, @Body() dto: CreateTaskDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskService.create({ ...dto, boardColumnId: +columnId }, tenantId, user.id)
  }

  @Get('columns/:columnId/tasks')
  @Auth()
  findByColumn(@Param('columnId') columnId: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskService.findByColumn(+columnId, tenantId)
  }

  @Get('tasks/:id')
  @Auth()
  findOne(@Param('id') id: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskService.findOne(+id, tenantId)
  }

  @Put('tasks/:id')
  @Auth()
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskService.update(+id, dto, tenantId)
  }

  @Delete('tasks/:id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskService.remove(+id, tenantId)
  }

  @Put('tasks/:id/move')
  @Auth()
  move(@Param('id') id: string, @Body() dto: MoveTaskDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskService.move(+id, dto, tenantId)
  }

  @Put('tasks/:id/assign')
  @Auth()
  assign(@Param('id') id: string, @Body() dto: AssignTaskDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskService.assign(+id, dto, tenantId)
  }

  @Post('columns/:columnId/tasks/generate-with-ai')
  @Auth()
  generateWithAI(@Param('columnId') columnId: string, @Body() dto: { prompt: string }, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.taskService.generateTasksWithAI(+columnId, dto.prompt, tenantId)
  }
}
