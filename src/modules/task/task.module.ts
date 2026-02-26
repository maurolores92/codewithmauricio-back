import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Task } from './task.model'
import { BoardColumn } from '../boardColumn/boardColumn.model'
import { Users } from '../users/users.model'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

@Module({
  imports: [SequelizeModule.forFeature([Task, BoardColumn, Users])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [SequelizeModule, TaskService]
})
export class TaskModule {}
