import { Module } from '@nestjs/common'
import { BoardModule } from '../board/board.module'
import { BoardColumnModule } from '../boardColumn/boardColumn.module'
import { TaskModule } from '../task/task.module'

@Module({
  imports: [BoardModule, BoardColumnModule, TaskModule]
})
export class KanbanModule {}
