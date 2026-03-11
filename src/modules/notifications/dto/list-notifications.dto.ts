import { IsIn, IsOptional } from 'class-validator'

export class ListNotificationsDto {
  @IsOptional()
  @IsIn(['all', 'read', 'unread'])
  status?: 'all' | 'read' | 'unread'
}
