import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '../role/role.model';
import { Users } from './users.model';

@Module({
  imports: [SequelizeModule.forFeature([Users, Role])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [SequelizeModule, UsersService]
})
export class UsersModule {}
