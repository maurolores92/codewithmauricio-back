import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Board } from "../board/board.model";
import { Users } from "../users/users.model";
import { Task } from "../task/task.model";

@Table({timestamps: true})
export class BoardColumn extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column(DataType.STRING)
    declare name: string;

    @Column(DataType.INTEGER)
    declare position: number;

    @ForeignKey(() => Board)
    @Column(DataType.INTEGER)
    declare boardId: number;

    @BelongsTo(() => Board, { foreignKey: 'boardId', as: 'board' })
    declare board?: Board

    @ForeignKey(() => Users)
    @Column(DataType.INTEGER)
    declare tenantId: number;
    
    @BelongsTo(() => Users, { foreignKey: 'tenantId', as: 'tenant' })
    declare tenant?: Users

    @ForeignKey(() => Users)
    @Column(DataType.INTEGER)
    declare createdBy: number;

    @BelongsTo(() => Users, { foreignKey: 'createdBy', as: 'creator' })
    declare creator?: Users

    @HasMany(() => Task, { foreignKey: 'boardColumnId', as: 'tasks' })
    declare tasks?: Task[]

    @Column(DataType.DATE)
    declare createdAt: Date;

}