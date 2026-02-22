import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(@InjectConnection() private sequelize: Sequelize) {}

  // force: true - hace que la base de datos se restablezca por completo vaciandola y creando nuevamente la estructura de tablas.
  // alter: true - hace que la base de datos se actualice en caso de que existan cambios en las definiciones de las tablas.

  async onModuleInit() {
    await this.sequelize.sync({ alter: true, force: false });
  }
}