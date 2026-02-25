import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { SeedService } from "../modules/seeders/seeders.service";

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    @InjectConnection() private sequelize: Sequelize,
    private seedService: SeedService
  ) {}

  // force: true - hace que la base de datos se restablezca por completo vaciandola y creando nuevamente la estructura de tablas.
  // alter: true - hace que la base de datos se actualice en caso de que existan cambios en las definiciones de las tablas.

  async onModuleInit() {
    await this.sequelize.sync({ alter: true, force: false });
    
    // Ejecutar seeds automáticamente después de sincronizar
    try {
      console.log('Ejecutando seeds...');
      await this.seedService.seedAll();
      console.log('Seeds ejecutados correctamente');
    } catch (error) {
      console.error('Error ejecutando seeds:', error.message);
    }
  }
}