import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'
import { TaskComment } from './task-comment.model'
import { Users } from '../../users/users.model'

@Table({ timestamps: true })
export class TaskCommentMention extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @ForeignKey(() => TaskComment)
  @Column({ type: DataType.INTEGER, unique: 'uq_comment_mentioned_user' })
  declare commentId: number

  @BelongsTo(() => TaskComment, { foreignKey: 'commentId', as: 'comment' })
  declare comment?: TaskComment

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, unique: 'uq_comment_mentioned_user' })
  declare mentionedUserId: number

  @BelongsTo(() => Users, { foreignKey: 'mentionedUserId', as: 'mentionedUser' })
  declare mentionedUser?: Users

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  declare mentionedByUserId: number

  @BelongsTo(() => Users, { foreignKey: 'mentionedByUserId', as: 'mentionedBy' })
  declare mentionedBy?: Users

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  declare tenantId: number

  @BelongsTo(() => Users, { foreignKey: 'tenantId', as: 'tenant' })
  declare tenant?: Users

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isRead: boolean

  @Column({ type: DataType.DATE, allowNull: true })
  declare readAt?: Date
}
