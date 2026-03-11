import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { WebsocketModule } from 'src/common/socket/websocket.module'
import { Notification } from './notification.model'

@Module({
  imports: [WebsocketModule, SequelizeModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService, SequelizeModule],
})
export class NotificationsModule {}
