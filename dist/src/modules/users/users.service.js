"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const common_1 = require("@nestjs/common");
const sequelize_2 = require("@nestjs/sequelize");
const crud_service_1 = require("../../common/crud/crud.service");
const role_model_1 = require("../role/role.model");
const users_model_1 = require("./users.model");
let UsersService = UsersService_1 = class UsersService extends crud_service_1.CrudService {
    userModel;
    sequelize;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userModel, sequelize) {
        super(userModel);
        this.userModel = userModel;
        this.sequelize = sequelize;
    }
    async create(data) {
        const transaction = await this.sequelize.transaction();
        try {
            const { roleId, password, ...userData } = data;
            const userExist = await this.userModel.findOne({ where: { email: userData.email }, transaction });
            if (userExist) {
                throw new common_1.BadRequestException('El usuario ya existe');
            }
            let finalRoleId = roleId;
            if (!finalRoleId) {
                const defaultRole = await role_model_1.Role.findOne({ where: { slug: 'usuario' }, transaction });
                if (!defaultRole) {
                    throw new common_1.BadRequestException('No se encontró el rol por defecto');
                }
                finalRoleId = defaultRole.id;
            }
            else {
                const role = await role_model_1.Role.findByPk(finalRoleId, { transaction });
                if (!role) {
                    throw new common_1.BadRequestException('El rol no es válido');
                }
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            userData.password = hashedPassword;
            const user = await this.userModel.create({
                ...userData,
                roleId: finalRoleId,
                isActive: true,
                isVerified: false
            }, { transaction });
            await transaction.commit();
            const createdUser = await this.userModel.findByPk(user.id, {
                attributes: { exclude: ['password'] }
            });
            return createdUser;
        }
        catch (error) {
            this.logger.error(error.message);
            await transaction.rollback();
            throw error;
        }
    }
    async findAll() {
        const users = await this.userModel.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: role_model_1.Role }],
        });
        return users;
    }
    async findAllQuerys(page, pageSize, filters) {
        const offset = page * pageSize;
        const limit = pageSize;
        const where = {};
        if (filters.search) {
            where[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${filters.search}%` } },
                { lastName: { [sequelize_1.Op.like]: `%${filters.search}%` } },
                { email: { [sequelize_1.Op.like]: `%${filters.search}%` } }
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
                    model: role_model_1.Role,
                    where: { slug: { [sequelize_1.Op.ne]: 'superadmin' } },
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
    async findOne(id) {
        const user = await this.userModel.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            throw new common_1.NotFoundException(`Record with id ${id} not found`);
        }
        return user;
    }
    async findOneByEmail(userEmail) {
        const user = await this.userModel.findOne({
            where: { email: userEmail },
            include: [{ model: role_model_1.Role }],
        });
        if (!user) {
            throw new common_1.BadRequestException(`Record with email: ${userEmail} not found`);
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
    async isUserUnique(userEmail) {
        const user = await this.userModel.findOne({
            where: { email: userEmail.toLowerCase() },
        });
        return user == null;
    }
    async changePassword(userId, newPassword) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const hashedPassword = await users_model_1.Users.hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();
        return { message: 'Contraseña actualizada exitosamente' };
    }
    async updateUser(userId, updateData) {
        const transaction = await this.sequelize.transaction();
        try {
            const user = await this.userModel.findByPk(userId, { transaction });
            if (!user) {
                throw new common_1.NotFoundException(`Usuario con ID ${userId} no encontrado`);
            }
            const { password, ...allowedUpdates } = updateData;
            if (allowedUpdates.email && allowedUpdates.email !== user.email) {
                const existingUser = await this.userModel.findOne({
                    where: { email: allowedUpdates.email },
                    transaction
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('El email ya está en uso');
                }
            }
            await user.update(allowedUpdates, { transaction });
            await transaction.commit();
            const updatedUser = await this.userModel.findByPk(userId, {
                attributes: { exclude: ['password'] }
            });
            return updatedUser;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async getUserProfile(userId) {
        const userWithRole = await this.userModel.findByPk(userId, {
            include: [{ model: role_model_1.Role }],
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_2.InjectModel)(users_model_1.Users)),
    __metadata("design:paramtypes", [Object, sequelize_typescript_1.Sequelize])
], UsersService);
//# sourceMappingURL=users.service.js.map