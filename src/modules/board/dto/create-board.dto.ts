import { IsInt, IsOptional, IsString } from 'class-validator'

export class CreateBoardDto {
  @IsString()
  name: string

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
