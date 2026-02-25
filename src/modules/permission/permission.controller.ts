// filepath: /mnt/MauroLP/Proyectos/codewithmauricio/back/src/modules/permission/permission.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Auth(ValidRoles.superadmin)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }

  @Put(':id')
  @Auth(ValidRoles.superadmin)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }

  @Post('assign-to-role')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  assignPermissionsToRole(@Body() assignPermissionsDto: AssignPermissionsDto, @GetUser() user: any) {
    return this.permissionService.assignPermissionsToRole(
      assignPermissionsDto.roleId,
      assignPermissionsDto.permissionIds,
      user.id
    );
  }

  @Get('role/:roleId')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  getRolePermissions(@Param('roleId') roleId: string) {
    return this.permissionService.getRolePermissions(+roleId);
  }

  @Get('user/:userId')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  getUserPermissions(@Param('userId') userId: string) {
    return this.permissionService.getUserPermissions(+userId);
  }
}