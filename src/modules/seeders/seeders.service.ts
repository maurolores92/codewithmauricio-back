import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../role/role.model';
import { Users } from '../users/users.model';
import { Permission } from '../permission/permission.model';
import { RolePermission } from '../role/role-permission/role-permission.model';
import { seedPermissions } from '../permission/seed/permissions.seed';

@Injectable()
export class SeedService {
  constructor(
    private sequelize: Sequelize,
  ) {}

  async seedRoles() {
    const transaction = await this.sequelize.transaction();
    try {
      const roles: any[] = [
        { name: 'Super Admin', slug: 'superadmin', color: '#F44336', userId: null },
        { name: 'Admin', slug: 'admin', color: '#4CAF50', userId: null },
        { name: 'Usuario', slug: 'usuario', color: '#2196F3', userId: null },
      ];

      for (const role of roles) {
        await Role.findOrCreate({
          where: { slug: role.slug, userId: null },
          defaults: role,
          transaction
        });
      }

      await transaction.commit();
      return {
        message: 'Roles created successfully',
        count: roles.length
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating roles:', error);
      throw new Error('Error creating roles: ' + error.message);
    }
  }

  async seedUsers() {
    const transaction = await this.sequelize.transaction();
    try {
      const users: any[] = [
        { 
          name: 'Super', 
          lastName: 'Admin',
          email: 'superadmin@codewithmauricio.tech',
          phone: '+1234567890',
          password: 'superadmin123', 
          roleSlug: 'superadmin',
          isAdmin: true
        },
        { 
          name: 'Usuario', 
          lastName: 'Prueba',
          email: 'usuario@codewithmauricio.tech',
          phone: '+9876543210',
          password: 'usuario123', 
          roleSlug: 'admin',
          isAdmin: true
        },
      ];

      for (const user of users) {
        const {roleSlug, password, isAdmin, ...rest} = user;
        
        rest.password = await Users.hashPassword(user.password);

        const roleRecord = await Role.findOne({ 
          where: { slug: roleSlug, userId: null }, 
          attributes: ['id'], 
          transaction 
        });
        
        if (roleRecord) {
          await Users.findOrCreate({
            where: { email: rest.email },
            defaults: {
              ...rest,
              roleId: roleRecord.id,
              isAdmin: isAdmin,
              createdByAdminId: null,
              isActive: true,
              isVerified: false
            },
            transaction
          });
        } else {
          console.warn(`Role with slug '${roleSlug}' not found for user ${user.email}`);
        }
      }

      await transaction.commit();
      return {
        message: 'Users created successfully',
        count: users.length
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating users:', error);
      throw new Error('Error creating users: ' + error.message);
    }
  }

  private async assignDefaultPermissions() {
    try {
      // Obtener todos los roles globales (userId: null)
      const superadminRole = await Role.findOne({ where: { slug: 'superadmin', userId: null } });
      const adminRole = await Role.findOne({ where: { slug: 'admin', userId: null } });
      
      // Obtener todos los permisos disponibles
      const allPermissions = await Permission.findAll();

      if (allPermissions.length === 0) {
        console.warn('⚠️ No hay permisos para asignar');
        return;
      }

      // Asignar TODOS los permisos al SuperAdmin
      if (superadminRole) {
        await RolePermission.destroy({ where: { roleId: superadminRole.id } });
        
        const superadminPermissions = allPermissions.map(permission => ({
          roleId: superadminRole.id,
          permissionId: permission.id
        }));
        
        await RolePermission.bulkCreate(superadminPermissions);
        console.log(`✅ ${allPermissions.length} permisos asignados al SuperAdmin`);
      }

      // Asignar TODOS los permisos al Admin
      if (adminRole) {
        await RolePermission.destroy({ where: { roleId: adminRole.id } });
        
        const adminPermissions = allPermissions.map(permission => ({
          roleId: adminRole.id,
          permissionId: permission.id
        }));
        
        await RolePermission.bulkCreate(adminPermissions);
        console.log(`✅ ${allPermissions.length} permisos asignados al Admin`);
      }

      // El rol Usuario no obtiene permisos por defecto (vacío)
      console.log('✅ Permisos del Usuario (vacío por defecto)');

    } catch (error) {
      console.error('Error asignando permisos por defecto:', error);
      throw error;
    }
  }

  async seedAll() {
    try {
      console.log('🌱 Iniciando seeders...');
      
      const rolesResult = await this.seedRoles();
      console.log('✅ Roles creados');
      
      const usersResult = await this.seedUsers();
      console.log('✅ Usuarios creados');

      await seedPermissions();
      console.log('✅ Permisos creados');

      await this.assignDefaultPermissions();
      console.log('✅ Permisos asignados a roles');

      return {
        message: 'All seeds executed successfully',
        results: {
          roles: rolesResult,
          users: usersResult
        }
      };
    } catch (error) {
      console.error('Error during complete seed process:', error);
      throw error;
    }
  }

  async seed() {
    return await this.seedAll();
  }
}