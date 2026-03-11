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
import { Users } from '../users/users.model'

@Table({ timestamps: true })
export class Notification extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  declare userId: number

  @BelongsTo(() => Users, { foreignKey: 'userId', as: 'user' })
  declare user?: Users

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  declare tenantId: number

  @BelongsTo(() => Users, { foreignKey: 'tenantId', as: 'tenant' })
  declare tenant?: Users

  @Column(DataType.STRING)
  declare type: string

  @Column(DataType.STRING)
  declare title: string

  @Column(DataType.TEXT)
  declare message: string

  @Column({ type: DataType.JSONB, allowNull: true })
  declare data?: Record<string, any>

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isRead: boolean

  @Column({ type: DataType.DATE, allowNull: true })
  declare readAt?: Date

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare createdByUserId?: number

  @BelongsTo(() => Users, { foreignKey: 'createdByUserId', as: 'createdByUser' })
  declare createdByUser?: Users
}
