import { IsInt, IsOptional, IsString } from 'class-validator'

export class CreateBoardColumnDto {
  @IsString()
  name: string

  @IsOptional()
  @IsInt()
  boardId?: number

  @IsOptional()
  @IsInt()
  position?: number

  @IsOptional()
  @IsInt()
  tenantId?: number

  @IsOptional()
  @IsInt()
  createdBy?: number
}
