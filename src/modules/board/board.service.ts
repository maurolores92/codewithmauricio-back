import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Board } from './board.model'
import { BoardColumn } from '../boardColumn/boardColumn.model'
import { Task } from '../task/task.model'
import { CreateBoardDto } from './dto/create-board.dto'
import { UpdateBoardDto } from './dto/update-board.dto'

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board) private readonly boardModel: typeof Board,
    @InjectModel(BoardColumn) private readonly boardColumnModel: typeof BoardColumn,
    @InjectModel(Task) private readonly taskModel: typeof Task
  ) {}

  async create(dto: CreateBoardDto, tenantId: number, createdBy: number): Promise<Board> {
    const position = dto.position ?? 0
    return this.boardModel.create({ ...dto, position, tenantId, createdBy } as any)
  }

  async findAll(tenantId: number): Promise<Board[]> {
    return this.boardModel.findAll({ 
      where: { tenantId },
      order: [['position', 'ASC'], ['id', 'ASC']]
    })
  }

  async reorder(boardIds: number[], tenantId: number): Promise<void> {
    // Verificar que todos los boards pertenecen al tenant
    const boards = await this.boardModel.findAll({
      where: { id: boardIds, tenantId }
    })

    if (boards.length !== boardIds.length) {
      throw new NotFoundException('Algunos tableros no fueron encontrados')
    }

    // Actualizar posiciones
    for (let i = 0; i < boardIds.length; i++) {
      await this.boardModel.update(
        { position: i },
        { where: { id: boardIds[i], tenantId } }
      )
    }
  }

  async findOne(id: number, tenantId: number): Promise<Board> {
    const board = await this.boardModel.findByPk(id)
    if (!board) {
      throw new NotFoundException('Tablero no encontrado')
    }
    if (board.tenantId !== tenantId) {
      throw new NotFoundException('Tablero no encontrado')
    }
    return board
  }

  async update(id: number, dto: UpdateBoardDto, tenantId: number): Promise<Board> {
    const board = await this.findOne(id, tenantId)
    await board.update(dto as any)
    return board
  }

  async remove(id: number, tenantId: number): Promise<void> {
    const board = await this.findOne(id, tenantId)
    
    try {
      // Obtener todas las columnas del board
      const columns = await this.boardColumnModel.findAll({
        where: { boardId: id }
      })

      // Eliminar todas las tareas de cada columna
      for (const column of columns) {
        await this.taskModel.destroy({
          where: { boardColumnId: column.id }
        })
      }

      // Eliminar todas las columnas
      await this.boardColumnModel.destroy({
        where: { boardId: id }
      })

      // Finalmente, eliminar el board
      await board.destroy()
    } catch (error) {
      throw new BadRequestException('Error al eliminar el tablero. Intenta nuevamente.')
    }
  }
}
