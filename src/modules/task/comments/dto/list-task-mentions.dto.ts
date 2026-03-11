import { IsIn, IsOptional } from 'class-validator'

export class ListTaskMentionsDto {
  @IsOptional()
  @IsIn(['all', 'read', 'unread'])
  status?: 'all' | 'read' | 'unread'
}
