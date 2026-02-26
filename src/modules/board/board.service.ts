import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Board } from './board.model'
import { BoardColumn } from '../boardColumn/boardColumn.model'
import { Task } from '../task/task.model'
import { CreateBoardDto } from './dto/create-board.dto'
import { UpdateBoardDto } from './dto/update-board.dto'
import { AiService } from '../../ai/ai.service'

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board) private readonly boardModel: typeof Board,
    @InjectModel(BoardColumn) private readonly boardColumnModel: typeof BoardColumn,
    @InjectModel(Task) private readonly taskModel: typeof Task,
    private readonly aiService: AiService
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

  async generateBoardsWithAI(prompt: string, tenantId: number): Promise<{ boards: string[] }> {
    try {
      const systemPrompt = `Eres un asistente que ayuda a generar nombres de tableros Kanban.
Debes analizar la solicitud del usuario y devolver SOLO un array JSON de strings con nombres de tableros.
Máximo 5 tableros.
Los nombres deben ser claros, concisos y en español.
Ejemplos de respuesta válida:
["Desarrollo Frontend", "Backend API", "Testing y QA"]
["Diseño UX/UI", "Implementación", "Revisión"]

NO agregues explicaciones, solo el array JSON.`

      const fullPrompt = `${systemPrompt}\n\nSolicitud del usuario: ${prompt}`
      const aiResponse = await this.aiService.generateText(fullPrompt)

      // Intentar parsear la respuesta
      let boards: string[]
      try {
        // Intentar extraer el JSON de la respuesta
        const jsonMatch = aiResponse.match(/\[.*\]/s)
        if (jsonMatch) {
          boards = JSON.parse(jsonMatch[0])
        } else {
          boards = JSON.parse(aiResponse)
        }
      } catch (parseError) {
        // Si falla el parseo, intentar extraer líneas como nombres
        boards = aiResponse
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('{') && !line.startsWith('['))
          .map(line => line.replace(/^[\d\.\-\*]\s*/, '').replace(/["\[\]]/g, ''))
          .slice(0, 5)
      }

      // Validar y limpiar
      boards = boards
        .filter(name => typeof name === 'string' && name.trim().length > 0)
        .map(name => name.trim().substring(0, 100))
        .slice(0, 5)

      if (boards.length === 0) {
        throw new Error('No se pudieron generar tableros')
      }

      return { boards }
    } catch (error) {
      console.error('Error generando tableros con IA:', error)
      throw new BadRequestException('No se pudo generar tableros con IA. Intenta reformular tu solicitud.')
    }
  }
}
