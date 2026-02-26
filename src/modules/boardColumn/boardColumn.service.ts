import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { BoardColumn } from './boardColumn.model'
import { CreateBoardColumnDto } from './dto/create-board-column.dto'
import { UpdateBoardColumnDto } from './dto/update-board-column.dto'
import { ReorderBoardColumnsDto } from './dto/reorder-board-columns.dto'
import { Board } from '../board/board.model'

@Injectable()
export class BoardColumnService {
  constructor(
    @InjectModel(BoardColumn) private readonly boardColumnModel: typeof BoardColumn,
    @InjectModel(Board) private readonly boardModel: typeof Board
  ) {}

  async create(dto: CreateBoardColumnDto, tenantId: number, createdBy: number): Promise<BoardColumn> {
    const board = await this.boardModel.findByPk(dto.boardId)
    if (!board || board.tenantId !== tenantId) {
      throw new NotFoundException('Tablero no encontrado')
    }
    return this.boardColumnModel.create({ ...dto, tenantId, createdBy } as any)
  }

  async findByBoard(boardId: number, tenantId: number): Promise<BoardColumn[]> {
    const board = await this.boardModel.findByPk(boardId)
    if (!board || board.tenantId !== tenantId) {
      throw new NotFoundException('Tablero no encontrado')
    }
    return this.boardColumnModel.findAll({ where: { boardId, tenantId }, order: [['position', 'ASC']] })
  }

  async findOne(id: number, tenantId: number): Promise<BoardColumn> {
    const column = await this.boardColumnModel.findByPk(id)
    if (!column) {
      throw new NotFoundException('Columna no encontrada')
    }
    if (column.tenantId !== tenantId) {
      throw new NotFoundException('Columna no encontrada')
    }
    return column
  }

  async update(id: number, dto: UpdateBoardColumnDto, tenantId: number): Promise<BoardColumn> {
    const column = await this.findOne(id, tenantId)
    await column.update(dto as any)
    return column
  }

  async remove(id: number, tenantId: number): Promise<void> {
    const column = await this.findOne(id, tenantId)
    await column.destroy()
  }

  async reorder(dto: ReorderBoardColumnsDto, tenantId: number): Promise<void> {
    await Promise.all(
      dto.items.map(item =>
        this.boardColumnModel.update({ position: item.position }, { where: { id: item.id, tenantId } })
      )
    )
  }
}
