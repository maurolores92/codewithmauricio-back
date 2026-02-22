import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from '../users/users.model';
import { Role } from './role.model';

@Module({
  imports:[SequelizeModule.forFeature([Role, Users])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [SequelizeModule],
})
export class RoleModule {}
