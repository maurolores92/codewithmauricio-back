import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { BoardColumn } from './boardColumn.model'
import { Board } from '../board/board.model'
import { BoardColumnController } from './boardColumn.controller'
import { BoardColumnService } from './boardColumn.service'
import { AiModule } from '../../ai/ai.module'

@Module({
  imports: [
    SequelizeModule.forFeature([BoardColumn, Board]),
    AiModule
  ],
  controllers: [BoardColumnController],
  providers: [BoardColumnService],
  exports: [SequelizeModule, BoardColumnService]
})
export class BoardColumnModule {}
