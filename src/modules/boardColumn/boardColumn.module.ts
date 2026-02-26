import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { BoardColumn } from './boardColumn.model'
import { Board } from '../board/board.model'
import { BoardColumnController } from './boardColumn.controller'
import { BoardColumnService } from './boardColumn.service'

@Module({
  imports: [SequelizeModule.forFeature([BoardColumn, Board])],
  controllers: [BoardColumnController],
  providers: [BoardColumnService],
  exports: [SequelizeModule, BoardColumnService]
})
export class BoardColumnModule {}
