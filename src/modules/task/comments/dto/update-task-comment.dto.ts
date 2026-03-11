import { IsArray, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateTaskCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  mentionedUserIds?: number[]
}
