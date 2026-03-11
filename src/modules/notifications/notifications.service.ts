import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { WebsocketService } from 'src/common/socket/websocket.service'
import { WS_EVENTS } from 'src/websocket/websocket.events'
import { Notification } from './notification.model'

type CreateNotificationInput = {
  userId: number
  tenantId: number
  type: string
  title: string
  message: string
  data?: Record<string, any>
  createdByUserId?: number
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification) private readonly notificationModel: typeof Notification,
    private readonly websocketService: WebsocketService,
  ) {}

  async createForUser(input: CreateNotificationInput): Promise<Notification> {
    const notification = await this.notificationModel.create({
      ...input,
      isRead: false,
    } as any)

    this.websocketService.emitToUser(input.userId, WS_EVENTS.NEW_NOTIFICATION, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      data: notification.data || {},
    })

    return notification
  }

  async findMyNotifications(userId: number, tenantId: number, status?: 'all' | 'read' | 'unread'): Promise<Notification[]> {
    const where: Record<string, any> = {
      userId,
      tenantId,
    }

    if (status === 'read') where.isRead = true
    if (status === 'unread') where.isRead = false

    return this.notificationModel.findAll({
      where,
      order: [['isRead', 'ASC'], ['createdAt', 'DESC']],
    })
  }

  async markAsRead(notificationId: number, userId: number, tenantId: number): Promise<Notification> {
    const notification = await this.notificationModel.findByPk(notificationId)
    if (!notification || notification.userId !== userId || notification.tenantId !== tenantId) {
      throw new NotFoundException('Notificacion no encontrada')
    }

    await notification.update({
      isRead: true,
      readAt: notification.readAt || new Date(),
    } as any)

    return notification
  }

  async markAllAsRead(userId: number, tenantId: number): Promise<{ updated: number }> {
    const [updated] = await this.notificationModel.update(
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        where: {
          userId,
          tenantId,
          isRead: false,
        },
      },
    )

    return { updated }
  }
}
