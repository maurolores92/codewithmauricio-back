import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table,
} from 'sequelize-typescript'
import { Task } from '../task.model'
import { Users } from '../../users/users.model'
import { TaskCommentMention } from './task-comment-mention.model'

@Table({ timestamps: true })
export class TaskComment extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @ForeignKey(() => Task)
  @Column(DataType.INTEGER)
  declare taskId: number

  @BelongsTo(() => Task, { foreignKey: 'taskId', as: 'task' })
  declare task?: Task

  @ForeignKey(() => TaskComment)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare parentCommentId?: number

  @BelongsTo(() => TaskComment, { foreignKey: 'parentCommentId', as: 'parentComment' })
  declare parentComment?: TaskComment

  @HasMany(() => TaskComment, { foreignKey: 'parentCommentId', as: 'replies' })
  declare replies?: TaskComment[]

  @Column(DataType.TEXT)
  declare content: string

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  declare tenantId: number

  @BelongsTo(() => Users, { foreignKey: 'tenantId', as: 'tenant' })
  declare tenant?: Users

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  declare createdBy: number

  @BelongsTo(() => Users, { foreignKey: 'createdBy', as: 'author' })
  declare author?: Users

  @HasMany(() => TaskCommentMention, { foreignKey: 'commentId', as: 'mentions' })
  declare mentions?: TaskCommentMention[]
}
