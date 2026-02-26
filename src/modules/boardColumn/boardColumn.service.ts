import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { BoardColumn } from './boardColumn.model'
import { CreateBoardColumnDto } from './dto/create-board-column.dto'
import { UpdateBoardColumnDto } from './dto/update-board-column.dto'
import { ReorderBoardColumnsDto } from './dto/reorder-board-columns.dto'
import { Board } from '../board/board.model'
import { AiService } from '../../ai/ai.service'

@Injectable()
export class BoardColumnService {
  constructor(
    @InjectModel(BoardColumn) private readonly boardColumnModel: typeof BoardColumn,
    @InjectModel(Board) private readonly boardModel: typeof Board,
    private readonly aiService: AiService
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

  async generateColumnsWithAI(boardId: number, prompt: string, tenantId: number): Promise<{ columns: string[] }> {
    try {
      // Verificar que el board existe y pertenece al tenant
      const board = await this.boardModel.findByPk(boardId)
      if (!board || board.tenantId !== tenantId) {
        throw new NotFoundException('Tablero no encontrado')
      }

      const systemPrompt = `Eres un asistente que ayuda a generar nombres de columnas para tableros Kanban.
Debes analizar la solicitud del usuario y devolver SOLO un array JSON de strings con nombres de columnas.
Máximo 6 columnas.
Los nombres deben ser claros, concisos y en español.
Ejemplos de respuesta válida:
["Por hacer", "En progreso", "En revisión", "Completado"]
["Backlog", "Diseño", "Desarrollo", "Testing", "Desplegado"]

NO agregues explicaciones, solo el array JSON.`

      const fullPrompt = `${systemPrompt}\n\nSolicitud del usuario: ${prompt}`
      const aiResponse = await this.aiService.generateText(fullPrompt)

      // Intentar parsear la respuesta
      let columns: string[]
      try {
        // Intentar extraer el JSON de la respuesta
        const jsonMatch = aiResponse.match(/\[.*\]/s)
        if (jsonMatch) {
          columns = JSON.parse(jsonMatch[0])
        } else {
          columns = JSON.parse(aiResponse)
        }
      } catch (parseError) {
        // Si falla el parseo, intentar extraer líneas como nombres
        columns = aiResponse
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('{') && !line.startsWith('['))
          .map(line => line.replace(/^[\d\.\-\*]\s*/, '').replace(/["\[\]]/g, ''))
          .slice(0, 6)
      }

      // Validar y limpiar
      columns = columns
        .filter(name => typeof name === 'string' && name.trim().length > 0)
        .map(name => name.trim().substring(0, 100))
        .slice(0, 6)

      if (columns.length === 0) {
        throw new Error('No se pudieron generar columnas')
      }

      return { columns }
    } catch (error) {
      console.error('Error generando columnas con IA:', error)
      throw new BadRequestException('No se pudo generar columnas con IA. Intenta reformular tu solicitud.')
    }
  }
}
