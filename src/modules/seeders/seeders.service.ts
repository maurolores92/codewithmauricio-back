import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../role/role.model';
import { Users } from '../users/users.model';

@Injectable()
export class SeedService {
  constructor(
    private sequelize: Sequelize,
  ) {}

  async seedRoles() {
    const transaction = await this.sequelize.transaction();
    try {
      const roles: any[] = [
        { name: 'Super Admin', slug: 'superadmin', color: '#F44336' },
        { name: 'Usuario', slug: 'usuario', color: '#4CAF50' },
      ];

      for (const role of roles) {
        await Role.findOrCreate({
          where: { slug: role.slug },
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
          isActive: true, 
          isVerified: true,
          roleSlug: 'superadmin' 
        },
        { 
          name: 'Usuario', 
          lastName: 'Prueba',
          email: 'usuario@codewithmauricio.tech',
          phone: '+9876543210',
          password: 'usuario123', 
          isActive: true, 
          isVerified: true,
          roleSlug: 'usuario' 
        },
      ];

      for (const user of users) {
        const {roleSlug, password, ...rest} = user;
        
        rest.password = await Users.hashPassword(user.password);

        const roleRecord = await Role.findOne({ 
          where: { slug: roleSlug }, 
          attributes: ['id'], 
          transaction 
        });
        
        if (roleRecord) {
          rest.roleId = roleRecord.id;
          await Users.findOrCreate({
            where: { email: rest.email },
            defaults: rest,
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

  async seedAll() {
    try {
      const rolesResult = await this.seedRoles();
      const usersResult = await this.seedUsers();

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