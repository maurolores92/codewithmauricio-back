import { IsInt, IsOptional, IsString } from 'class-validator'

export class CreateTaskDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  boardColumnId?: number

  @IsOptional()
  @IsInt()
  position?: number

  @IsOptional()
  @IsInt()
  tenantId?: number

  @IsOptional()
  @IsInt()
  createdBy?: number

  @IsOptional()
  @IsInt()
  assignedUserId?: number
}
