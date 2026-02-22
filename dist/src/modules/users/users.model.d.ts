import { Model } from "sequelize-typescript";
import { Role } from "../role/role.model";
export declare class Users extends Model {
    id: number;
    name: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    roleId: number;
    role: Role;
    static hashPassword(password: string): Promise<string>;
    static setEmailBeforeCreate(instance: Users): void;
    static setEmailBeforeUpdate(instance: Users): void;
}
