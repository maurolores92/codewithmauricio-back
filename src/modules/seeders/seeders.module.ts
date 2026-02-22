import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeedService } from './seeders.service';
import { SeedController } from './seeders.controller';
import { Users } from '../users/users.model';
import { Role } from '../role/role.model';

@Module({
  imports: [SequelizeModule.forFeature([Users, Role])],
  providers: [SeedService],
  controllers: [SeedController],
  exports: [SeedService]
})
export class SeedModule {}