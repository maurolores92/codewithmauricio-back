import { Controller, Post, Body } from '@nestjs/common';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async sendNotification(@Body() body: any) {
    this.notificationsService.sendNotificationToAll(body);
    
    return { success: true };
  }
}
