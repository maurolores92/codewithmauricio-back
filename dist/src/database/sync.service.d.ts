import { OnModuleInit } from "@nestjs/common";
import { Sequelize } from "sequelize";
export declare class SyncService implements OnModuleInit {
    private sequelize;
    constructor(sequelize: Sequelize);
    onModuleInit(): Promise<void>;
}
