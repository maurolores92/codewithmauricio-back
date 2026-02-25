import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { Permission } from './permission.model';
import { Role } from '../role/role.model';
import { RolePermission } from '../role/role-permission/role-permission.model';

@Module({
  imports: [SequelizeModule.forFeature([Permission, Role, RolePermission])],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [SequelizeModule, PermissionService],
})
export class PermissionModule {}