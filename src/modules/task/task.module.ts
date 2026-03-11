import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Task } from './task.model'
import { BoardColumn } from '../boardColumn/boardColumn.model'
import { Users } from '../users/users.model'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'
import { AiModule } from '../../ai/ai.module'
import { TaskComment } from './comments/task-comment.model'
import { TaskCommentMention } from './comments/task-comment-mention.model'
import { TaskCommentsService } from './comments/task-comments.service'
import { TaskCommentsController } from './comments/task-comments.controller'
import { WebsocketModule } from 'src/common/socket/websocket.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Task, BoardColumn, Users, TaskComment, TaskCommentMention]),
    AiModule,
    WebsocketModule,
    NotificationsModule,
  ],
  controllers: [TaskController, TaskCommentsController],
  providers: [TaskService, TaskCommentsService],
  exports: [SequelizeModule, TaskService]
})
export class TaskModule {}
