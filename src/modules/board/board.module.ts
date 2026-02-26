import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Board } from './board.model'
import { BoardColumn } from '../boardColumn/boardColumn.model'
import { Task } from '../task/task.model'
import { BoardController } from './board.controller'
import { BoardService } from './board.service'

@Module({
  imports: [SequelizeModule.forFeature([Board, BoardColumn, Task])],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [SequelizeModule, BoardService]
})
export class BoardModule {}
