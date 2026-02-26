import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Task } from './task.model'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { MoveTaskDto } from './dto/move-task.dto'
import { AssignTaskDto } from './dto/assign-task.dto'
import { BoardColumn } from '../boardColumn/boardColumn.model'
import { Users } from '../users/users.model'
import { AiService } from '../../ai/ai.service'

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task) private readonly taskModel: typeof Task,
    @InjectModel(BoardColumn) private readonly boardColumnModel: typeof BoardColumn,
    @InjectModel(Users) private readonly usersModel: typeof Users,
    private readonly aiService: AiService
  ) {}

  async create(dto: CreateTaskDto, tenantId: number, createdBy: number): Promise<Task> {
    const column = await this.boardColumnModel.findByPk(dto.boardColumnId)
    if (!column || column.tenantId !== tenantId) {
      throw new NotFoundException('Columna no encontrada')
    }
    const task = await this.taskModel.create({ ...dto, tenantId, createdBy } as any)
    await task.reload({
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    return task
  }

  async findByColumn(boardColumnId: number, tenantId: number): Promise<Task[]> {
    const column = await this.boardColumnModel.findByPk(boardColumnId)
    if (!column || column.tenantId !== tenantId) {
      throw new NotFoundException('Columna no encontrada')
    }
    return this.taskModel.findAll({ 
      where: { boardColumnId, tenantId }, 
      order: [['position', 'ASC']],
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
  }

  async findOne(id: number, tenantId: number): Promise<Task> {
    const task = await this.taskModel.findByPk(id, {
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    if (!task) {
      throw new NotFoundException('Tarea no encontrada')
    }
    if (task.tenantId !== tenantId) {
      throw new NotFoundException('Tarea no encontrada')
    }
    return task
  }

  async update(id: number, dto: UpdateTaskDto, tenantId: number): Promise<Task> {
    const task = await this.findOne(id, tenantId)
    await task.update(dto as any)
    await task.reload({
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    return task
  }

  async remove(id: number, tenantId: number): Promise<void> {
    const task = await this.findOne(id, tenantId)
    await task.destroy()
  }

  async move(id: number, dto: MoveTaskDto, tenantId: number): Promise<Task> {
    const task = await this.findOne(id, tenantId)
    const column = await this.boardColumnModel.findByPk(dto.boardColumnId)
    if (!column || column.tenantId !== tenantId) {
      throw new NotFoundException('Columna no encontrada')
    }
    await task.update({ boardColumnId: dto.boardColumnId, position: dto.position } as any)
    await task.reload({
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    return task
  }

  async assign(id: number, dto: AssignTaskDto, tenantId: number): Promise<Task> {
    const task = await this.findOne(id, tenantId)

    if (dto.assignedUserId) {
      const assignee = await this.usersModel.findByPk(dto.assignedUserId)
      if (!assignee) {
        throw new NotFoundException('Usuario asignado no encontrado')
      }

      const isSameTenant = assignee.isAdmin
        ? assignee.id === tenantId
        : assignee.createdByAdminId === tenantId

      if (!isSameTenant) {
        throw new NotFoundException('Usuario asignado no encontrado')
      }
    }

    await task.update({ assignedUserId: dto.assignedUserId } as any)
    await task.reload({
      include: [
        {
          model: Users,
          as: 'assignedUser',
          attributes: ['id', 'name', 'lastName', 'email']
        }
      ]
    })
    return task
  }

  async generateTasksWithAI(boardColumnId: number, prompt: string, tenantId: number): Promise<{ tasks: Array<{ name: string; description: string }> }> {
    try {
      const column = await this.boardColumnModel.findByPk(boardColumnId)
      if (!column || column.tenantId !== tenantId) {
        throw new NotFoundException('Columna no encontrada')
      }

      const systemPrompt = `IMPORTANTE: Eres un asistente que EXTRAE tareas de una descripción.
NO INVENTES ni AGREGUES tareas que el usuario NO mencionó.
NO hagas interpretaciones creativas ni sugerencias.
SOLO genera las tareas que el usuario menciona EXPLÍCITAMENTE.

Devuelve un array JSON con objetos { name, description }.
Máximo 10 tareas. Mensajes claros, descripciones breves en español.
Las descripciones deben ser simples y directas (una línea máximo).

Ejemplo de lo que SÍ hacer:
Usuario dice: "cambiar mantel, reparar puerta, cambiar cerraduras"
Respuesta correcta:
[
  { "name": "Cambiar mantel de mesa", "description": "Reemplazar el mantel" },
  { "name": "Reparar puerta de cocina", "description": "Reparar la puerta dañada" },
  { "name": "Cambiar cerraduras", "description": "Instalar nuevas cerraduras" }
]

NO hagas esto:
[
  { "name": "Inspección inicial", "description": "..." },  <- NO MENCIONADO
  { "name": "Cambiar mantel", "description": "..." },
  { "name": "Reparar puerta", "description": "..." },
  { "name": "Cambiar cerraduras", "description": "..." },
  { "name": "Limpieza final", "description": "..." }  <- NO MENCIONADO
]

SOLO JSON, SIN EXPLICACIONES.`

      const fullPrompt = `${systemPrompt}\n\nSolicitud: ${prompt}`
      const aiResponse = await this.aiService.generateText(fullPrompt)

      let tasks: Array<{ name: string; description: string }>
      try {
        const jsonMatch = aiResponse.match(/\[.*\]/s)
        tasks = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse)
      } catch (parseError) {
        const lines = aiResponse.split('\n').filter(line => line.trim())
        tasks = lines
          .filter(line => !line.startsWith('{') && !line.startsWith('['))
          .map(line => ({
            name: line.replace(/^[\d\.\-\*]\s*/, '').substring(0, 100),
            description: 'Tarea a completar'
          }))
          .slice(0, 10)
      }

      tasks = tasks
        .filter(task => task && typeof task.name === 'string' && task.name.trim())
        .map(task => ({
          name: task.name.trim().substring(0, 100),
          description: (task.description || '').trim().substring(0, 500)
        }))
        .slice(0, 10)

      if (tasks.length === 0) throw new Error('No se pudieron generar tareas')
      return { tasks }
    } catch (error) {
      console.error('Error generando tareas con IA:', error)
      throw new BadRequestException('No se pudo generar tareas con IA. Intenta reformular tu solicitud.')
    }
  }
}
