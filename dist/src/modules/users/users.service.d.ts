import { Sequelize } from "sequelize-typescript";
import { CrudService } from 'src/common/crud/crud.service';
import { Users } from "./users.model";
export declare class UsersService extends CrudService<Users> {
    private readonly userModel;
    private sequelize;
    private readonly logger;
    constructor(userModel: typeof Users, sequelize: Sequelize);
    create(data: any): Promise<Users>;
    findAll(): Promise<Users[]>;
    findAllQuerys(page: number, pageSize: number, filters: {
        search?: string;
        roleId?: number;
    }): Promise<any>;
    findOne(id: number): Promise<Users>;
    findOneByEmail(userEmail: string): Promise<any>;
    isUserUnique(userEmail: string): Promise<Boolean>;
    changePassword(userId: number, newPassword: string): Promise<any>;
    updateUser(userId: number, updateData: any): Promise<Users>;
    getUserProfile(userId: number): Promise<{
        user: {
            id: number;
            name: string;
            lastName: string;
            email: string;
            role: string | null;
        };
        delivery: boolean;
    }>;
}
