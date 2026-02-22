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
    @InjectModel(Users) private readonly userModel: typeof Users,
    private sequelize: Sequelize,
  ) {
    super(userModel);
  }

  override async create(data: any): Promise<Users> {
    const transaction = await this.sequelize.transaction();
    try {
      const {roleId, password, ...userData} = data;

      const userExist = await this.userModel.findOne({where: {email: userData.email}, transaction});
      if(userExist) {
        throw new BadRequestException('El usuario ya existe');
      }
      
      // Si no se proporciona roleId, buscar el rol "usuario" por defecto
      let finalRoleId = roleId;
      if (!finalRoleId) {
        const defaultRole = await Role.findOne({where: {slug: 'usuario'}, transaction});
        if (!defaultRole) {
          throw new BadRequestException('No se encontró el rol por defecto');
        }
        finalRoleId = defaultRole.id;
      } else {
        const role = await Role.findByPk(finalRoleId, {transaction});
        if(!role) {
          throw new BadRequestException('El rol no es válido');
        }
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
      
      const user = await this.userModel.create({
        ...userData,
        roleId: finalRoleId,
        isActive: true, 
        isVerified: false
      }, {transaction});
      
      await transaction.commit();

      const createdUser = await this.userModel.findByPk(user.id, {
        attributes: { exclude: ['password'] }
      });
      
      return createdUser!;
    } catch (error: any) {
      this.logger.error(error.message);
      await transaction.rollback();
      
      throw error;
    }
  }

  override async findAll(): Promise<Users[]> {
    const users = await this.userModel.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Role }],
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
      include: [{ model: Role }],
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

  async updateUser(userId: number, updateData: any): Promise<Users> {
    const transaction = await this.sequelize.transaction();
    try {
      const user = await this.userModel.findByPk(userId, {transaction});
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
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

  async getUserProfile(userId: number) {
    const userWithRole = await this.userModel.findByPk(userId, {
      include: [{ model: Role }],
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
      },
      delivery: isDelivery,
    };
  }

}
