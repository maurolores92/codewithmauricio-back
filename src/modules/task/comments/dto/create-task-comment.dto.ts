import { IsArray, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateTaskCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string

  @IsOptional()
  @IsInt()
  parentCommentId?: number

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  mentionedUserIds?: number[]
}
