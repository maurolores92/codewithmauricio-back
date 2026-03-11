import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BoardColumn } from "../boardColumn/boardColumn.model";
import { Users } from "../users/users.model";
import { TaskComment } from './comments/task-comment.model'

@Table({timestamps: true})
export class Task extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => BoardColumn)
    @Column(DataType.INTEGER)
    declare boardColumnId: number;

    @BelongsTo(() => BoardColumn, { foreignKey: 'boardColumnId', as: 'column' })
    declare column?: BoardColumn

    @Column(DataType.STRING)
    declare name: string;

    @Column(DataType.STRING)
    declare description?: string;

    @Column(DataType.INTEGER)
    declare position: number;

    @ForeignKey(() => Users)
    @Column(DataType.INTEGER)
    declare tenantId: number;
    
    @BelongsTo(() => Users, { foreignKey: 'tenantId', as: 'tenant' })
    declare tenant?: Users

    @ForeignKey(() => Users)
    @Column(DataType.INTEGER)
    declare assignedUserId?: number;

    @BelongsTo(() => Users, { foreignKey: 'assignedUserId', as: 'assignedUser' })
    declare assignedUser?: Users

    @ForeignKey(() => Users)
    @Column(DataType.INTEGER)
    declare createdBy: number;

    @BelongsTo(() => Users, { foreignKey: 'createdBy', as: 'creator' })
    declare creator?: Users

    @HasMany(() => TaskComment, { foreignKey: 'taskId', as: 'comments' })
    declare comments?: TaskComment[]

}