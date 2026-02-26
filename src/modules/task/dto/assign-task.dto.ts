import { IsInt, IsOptional } from 'class-validator'

export class AssignTaskDto {
  @IsOptional()
  @IsInt()
  assignedUserId?: number
}
