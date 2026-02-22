import { Sequelize } from 'sequelize-typescript';
export declare class SeedService {
    private sequelize;
    constructor(sequelize: Sequelize);
    seedRoles(): Promise<{
        message: string;
        count: number;
    }>;
    seedUsers(): Promise<{
        message: string;
        count: number;
    }>;
    seedAll(): Promise<{
        message: string;
        results: {
            roles: {
                message: string;
                count: number;
            };
            users: {
                message: string;
                count: number;
            };
        };
    }>;
    seed(): Promise<{
        message: string;
        results: {
            roles: {
                message: string;
                count: number;
            };
            users: {
                message: string;
                count: number;
            };
        };
    }>;
}
