import * as bcrypt from "bcrypt";
import { Op } from 'sequelize';
import { Sequelize } from "sequelize-typescript";
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'src/common/crud/crud.service';
import { Role } from '../role/role.model';
import { Users } from "./users.model";


@Injectable()
export class UsersService extends CrudService<Users> {
   private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(Users) private readonly userModel: typeof Users, private sequelize: Sequelize, ) { super(userModel); }

  override async create(data: any, createdByAdminId?: number): Promise<Users> {
    const transaction = await this.sequelize.transaction();
    try {
      const {roleId, password, ...userData} = data;

      const userExist = await this.userModel.findOne({where: {email: userData.email}, transaction});
      if(userExist) {
        throw new BadRequestException('El usuario ya existe');
      }
      
      let finalRoleId = null;
      let isAdmin = false;
      
      if (roleId) {
        const role = await Role.findByPk(roleId, {transaction});
        if(!role) {
          throw new BadRequestException('El rol no es válido');
        }
        finalRoleId = roleId;
        
        if (role.slug === 'admin') {
          isAdmin = true;
        }
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
      
      const user = await this.userModel.create({
        ...userData,
        roleId: finalRoleId,
        isAdmin: isAdmin, // true solo si el rol es admin
        createdByAdminId: createdByAdminId || null, // Guardar el ID del admin que crea el usuario
        isActive: true, 
        isVerified: false
      }, {transaction});
      
      await transaction.commit();

      const createdUser = await this.userModel.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Role, as: 'role' }, { model: Role, as: 'customRoles' }]
      });
      
      return createdUser!;
    } catch (error: any) {
      this.logger.error(error.message);
      await transaction.rollback();
      
      throw error;
    }
  }

  override async findAll(adminId?: number): Promise<Users[]> {
    const where: any = {};
    
    if (adminId) {
      where.createdByAdminId = adminId;
    }
    
    const users = await this.userModel.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
    });

    return users;
  }

  async findAllQuerys(
    page: number,
    pageSize: number,
    filters: { search?: string; roleId?: number },
  ): Promise<any> {
    const offset = page * pageSize;
    const limit = pageSize;

    const where: any = {};
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { lastName: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    if (filters.roleId) {
      where.roleId = filters.roleId;
    }
    
    const users = await this.userModel.findAndCountAll({
      where,
      offset,
      limit,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'role',
          where: {slug: {[Op.ne]: 'superadmin'}},
        }
      ],
    });
    
    return {
      total: users.count,
      data: users.rows,
      page,
      pageSize
    };
  }

  override async findOne(id: number): Promise<Users> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return user;
  }

  async findOneByEmail(userEmail: string): Promise<any> {
    const user = await this.userModel.findOne({
      where: { email: userEmail },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new BadRequestException(`Record with email: ${userEmail} not found`);
    }
    
    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isAdmin: user.isAdmin,
      role: user.role ? user.role.slug : null
    };
  }

  async isUserUnique(userEmail: string): Promise<Boolean> {
    const user = await this.userModel.findOne({
      where: { email: userEmail.toLowerCase() },
    });

    return user == null;
  }

  async changePassword(userId: number, newPassword: string): Promise<any> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    const hashedPassword = await Users.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
  
    return { message: 'Contraseña actualizada exitosamente' };
  }

  async updateUser(userId: number, updateData: any, adminId?: number): Promise<Users> {
    const transaction = await this.sequelize.transaction();
    try {
      const user = await this.userModel.findByPk(userId, {transaction});
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }
      
      // Si se proporciona adminId, verificar que el usuario fue creado por ese admin
      if (adminId && user.createdByAdminId !== adminId) {
        throw new BadRequestException('No tienes permiso para editar este usuario');
      }
      
      const { password, ...allowedUpdates } = updateData;
      
      // Si se está actualizando el email, verificar que no exista
      if (allowedUpdates.email && allowedUpdates.email !== user.email) {
        const existingUser = await this.userModel.findOne({
          where: { email: allowedUpdates.email },
          transaction
        });
        if (existingUser) {
          throw new BadRequestException('El email ya está en uso');
        }
      }
      
      await user.update(allowedUpdates, {transaction});
    
      await transaction.commit();
      
      const updatedUser = await this.userModel.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      return updatedUser!;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteUser(userId: number, adminId?: number): Promise<void> {
    const transaction = await this.sequelize.transaction();
    try {
      const user = await this.userModel.findByPk(userId, {transaction});
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }
      
      // Si se proporciona adminId, verificar que el usuario fue creado por ese admin
      if (adminId && user.createdByAdminId !== adminId) {
        throw new BadRequestException('No tienes permiso para eliminar este usuario');
      }
      
      await user.destroy({transaction});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getUserProfile(userId: number) {
    const userWithRole = await this.userModel.findByPk(userId, {
      include: [{ model: Role, as: 'role' }, { model: Role, as: 'customRoles' }],
      attributes: { exclude: ['password'] }
    });

    if (!userWithRole) {
      throw new Error('Usuario no encontrado');
    }

    const roleSlug = userWithRole.role?.slug || null;
    const isDelivery = roleSlug === 'delivery';

    return {
      user: {
        id: userWithRole.id,
        name: userWithRole.name,
        lastName: userWithRole.lastName,
        email: userWithRole.email,
        role: roleSlug,
        isAdmin: userWithRole.isAdmin,
        customRoles: userWithRole.customRoles || [],
      },
      delivery: isDelivery,
    };
  }

  async createCustomRole(adminUserId: number, roleData: any): Promise<Role> {
    const transaction = await this.sequelize.transaction();
    try {
      console.log('[createCustomRole] Input:', { adminUserId, roleData });
      
      // Verificar que el usuario sea admin
      const admin = await this.userModel.findByPk(adminUserId, {transaction});
      console.log('[createCustomRole] Admin found:', {
        id: admin?.id,
        email: admin?.email,
        isAdmin: admin?.isAdmin
      });
      
      if (!admin || !admin.isAdmin) {
        throw new BadRequestException('Solo los usuarios admin pueden crear roles');
      }

      // Verificar que no exista un rol con el mismo slug para este admin
      const existingRole = await Role.findOne({
        where: { slug: roleData.slug, userId: adminUserId },
        transaction
      });
      if (existingRole) {
        throw new BadRequestException('Ya existe un rol con este slug');
      }

      const newRole = await Role.create({
        ...roleData,
        userId: adminUserId
      }, {transaction});

      await transaction.commit();
      console.log('[createCustomRole] Role created successfully:', newRole.id);
      return newRole;
    } catch (error) {
      await transaction.rollback();
      console.error('[createCustomRole] Error:', error.message);
      throw error;
    }
  }

  async getUserCustomRoles(userId: number): Promise<Role[]> {
    const roles = await Role.findAll({
      where: { userId: userId }
    });
    return roles;
  }

  async getAllAvailableRoles(): Promise<Role[]> {
    // Roles global (sin userId)
    const globalRoles = await Role.findAll({
      where: { userId: null }
    });
    return globalRoles;
  }

  async updateCustomRole(adminUserId: number, roleId: number, roleData: any): Promise<Role> {
    const transaction = await this.sequelize.transaction();
    try {
      console.log('[updateCustomRole] Input:', { adminUserId, roleId, roleData });

      // Buscar el rol
      const role = await Role.findByPk(roleId, { transaction });
      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }

      // Verificar que el rol pertenezca al usuario
      if (role.userId !== adminUserId) {
        throw new BadRequestException('No tienes permiso para editar este rol');
      }

      // Si se está cambiando el slug, verificar que no exista otro rol con ese slug para este usuario
      if (roleData.slug && roleData.slug !== role.slug) {
        const existingRole = await Role.findOne({
          where: { slug: roleData.slug, userId: adminUserId },
          transaction
        });
        if (existingRole) {
          throw new BadRequestException('Ya existe un rol con este slug');
        }
      }

      await role.update(roleData, { transaction });
      await transaction.commit();
      
      console.log('[updateCustomRole] Role updated successfully');
      return role;
    } catch (error) {
      await transaction.rollback();
      console.error('[updateCustomRole] Error:', error.message);
      throw error;
    }
  }

  async deleteCustomRole(adminUserId: number, roleId: number): Promise<void> {
    const transaction = await this.sequelize.transaction();
    try {
      console.log('[deleteCustomRole] Input:', { adminUserId, roleId });

      // Buscar el rol
      const role = await Role.findByPk(roleId, { transaction });
      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }

      // Verificar que el rol pertenezca al usuario
      if (role.userId !== adminUserId) {
        throw new BadRequestException('No tienes permiso para eliminar este rol');
      }

      // Verificar que no haya usuarios con este rol
      const usersWithRole = await this.userModel.count({
        where: { roleId: roleId },
        transaction
      });
      
      if (usersWithRole > 0) {
        throw new BadRequestException(`No se puede eliminar el rol porque hay ${usersWithRole} usuario(s) asignado(s)`);
      }

      await role.destroy({ transaction });
      await transaction.commit();
      
      console.log('[deleteCustomRole] Role deleted successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('[deleteCustomRole] Error:', error.message);
      throw error;
    }
  }

}
