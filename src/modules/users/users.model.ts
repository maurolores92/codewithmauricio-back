
import { AutoIncrement, BeforeCreate, BeforeUpdate, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
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

    @ForeignKey(() => Role)
    @Column({type: DataType.INTEGER, allowNull: false})
    declare roleId: number;

    @BelongsTo(() => Role)
    declare role: Role;

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
