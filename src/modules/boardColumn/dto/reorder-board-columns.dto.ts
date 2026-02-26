import { IsArray } from 'class-validator'

export class ReorderBoardColumnsDto {
  @IsArray()
  items: { id: number; position: number }[]
}
