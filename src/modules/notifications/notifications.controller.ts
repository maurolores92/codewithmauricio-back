import { Controller, Get, Param, Put, Query } from '@nestjs/common'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetUser } from '../auth/decorators/get-user.decorator'
import { Users } from '../users/users.model'
import { ListNotificationsDto } from './dto/list-notifications.dto'
import { NotificationsService } from './notifications.service'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private resolveTenantId(user: Users): number {
    return user.isAdmin ? user.id : user.createdByAdminId
  }

  @Get('me')
  @Auth()
  findMyNotifications(@Query() query: ListNotificationsDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.notificationsService.findMyNotifications(user.id, tenantId, query.status)
  }

  @Put(':notificationId/read')
  @Auth()
  markAsRead(@Param('notificationId') notificationId: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.notificationsService.markAsRead(+notificationId, user.id, tenantId)
  }

  @Put('me/read-all')
  @Auth()
  markAllAsRead(@GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.notificationsService.markAllAsRead(user.id, tenantId)
  }
}
