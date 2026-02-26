import { IsInt } from 'class-validator'

export class MoveTaskDto {
  @IsInt()
  boardColumnId: number

  @IsInt()
  position: number
}
