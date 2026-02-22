import { Injectable } from '@nestjs/common';
import { WebsocketService } from 'src/common/socket/websocket.service';


@Injectable()
export class NotificationsService {
  constructor(private readonly websocketService: WebsocketService) {}

  async sendNotificationToAll(body: any) {
    this.websocketService.emitToAll('new_notification', {
      ...body,
      timestamp: new Date(),
    });
  }
}
