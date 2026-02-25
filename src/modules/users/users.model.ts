
import { AutoIncrement, BeforeCreate, BeforeUpdate, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table, HasMany } from "sequelize-typescript";
import { Role } from "../role/role.model";
import * as bcrypt from "bcrypt";

@Table({timestamps: true})
export class Users extends Model {
    
    @PrimaryKey
    @AutoIncrement
    @Column
    declare id: number;

    @Column(DataType.STRING)
    declare name: string;

    @Column(DataType.STRING)
    declare lastName: string;

    @Column({type: DataType.STRING, unique: true})
    declare email: string;
    
    @Column(DataType.STRING)
    declare phone: string;

    @Column(DataType.STRING)
    declare password: string;

    @Column({type: DataType.BOOLEAN, defaultValue: false})
    declare isAdmin: boolean;

    @ForeignKey(() => Role)
    @Column({type: DataType.INTEGER, allowNull: true})
    declare roleId: number;

    @Column({type: DataType.INTEGER, allowNull: true})
    declare createdByAdminId: number;

    @BelongsTo(() => Role)
    declare role: Role;

    @HasMany(() => Role, {foreignKey: 'userId', as: 'customRoles'})
    declare customRoles: Role[];

    @Column({type: DataType.DATE, allowNull: true})
    declare lastLoginAt: Date;

    static async hashPassword(password: string): Promise<string> {
       const hashedPassword = await bcrypt.hash(password, 10);
       return hashedPassword;
    }
    
    @BeforeCreate
    static setEmailBeforeCreate(instance: Users) {
      if (instance.email) {
        instance.email = instance.email.toLowerCase().trim();
      }
    }
    
    @BeforeUpdate
    static setEmailBeforeUpdate(instance: Users) {
      if (instance.email) {
        instance.email = instance.email.toLowerCase().trim();
      }
    }
}
