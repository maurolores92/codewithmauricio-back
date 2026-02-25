// filepath: /mnt/MauroLP/Proyectos/codewithmauricio/back/src/modules/permission/permission.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from './permission.model';
import { Role } from '../role/role.model';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Sequelize } from 'sequelize-typescript';
import { RolePermission } from '../role/role-permission/role-permission.model';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission) private readonly permissionModel: typeof Permission,
    @InjectModel(Role) private readonly roleModel: typeof Role,
    @InjectModel(RolePermission) private readonly rolePermissionModel: typeof RolePermission,
    private sequelize: Sequelize,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionModel.findOne({
      where: { slug: createPermissionDto.slug }
    });
    
    if (existing) {
      throw new BadRequestException('Ya existe un permiso con este slug');
    }

    return this.permissionModel.create(createPermissionDto as any);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionModel.findAll({
      include: [{ model: Role, as: 'roles' }]
    });
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionModel.findByPk(id, {
      include: [{ model: Role, as: 'roles' }]
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    await permission.update(updatePermissionDto as any);
    return permission;
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    await permission.destroy();
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[], adminId?: number): Promise<Role> {
  const transaction = await this.sequelize.transaction();
  try {
    const role = await this.roleModel.findByPk(roleId, { transaction });
    
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Si el rol tiene userId, verificar que sea del admin
    if (role.userId && adminId && role.userId !== adminId) {
      throw new BadRequestException('No tienes permiso para modificar este rol');
    }

    // Eliminar permisos actuales
    await this.rolePermissionModel.destroy({
      where: { roleId },
      transaction
    });

    // Asignar nuevos permisos
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId
    }));

    await this.rolePermissionModel.bulkCreate(rolePermissions, { transaction });
    await transaction.commit();

    const updatedRole = await this.roleModel.findByPk(roleId, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    if (!updatedRole) {
      throw new NotFoundException('Rol no encontrado después de actualizar');
    }

    return updatedRole;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async getRolePermissions(roleId: number): Promise<Permission[]> {
  const role = await this.roleModel.findByPk(roleId, {
    include: [{ model: Permission, as: 'permissions' }]
  });

  if (!role) {
    throw new NotFoundException('Rol no encontrado');
  }

  return ((role.permissions as unknown) as Permission[]) || []; 
}

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const user = await this.sequelize.models.Users.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ]
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return (user as any).role?.permissions || [];
  }
}