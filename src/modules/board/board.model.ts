import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Users } from "../users/users.model";
import { BoardColumn } from "../boardColumn/boardColumn.model";

@Table({timestamps: true})
export class Board extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;
    
    @Column(DataType.STRING)
    declare name: string;

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    declare position: number;

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

    @HasMany(() => BoardColumn, { foreignKey: 'boardId', as: 'columns' })
    declare columns?: BoardColumn[]

    @Column(DataType.DATE)
    declare createdAt: Date;

}
