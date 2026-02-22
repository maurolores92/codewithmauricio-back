"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_typescript_1 = require("sequelize-typescript");
const role_model_1 = require("../role/role.model");
const users_model_1 = require("../users/users.model");
let SeedService = class SeedService {
    sequelize;
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async seedRoles() {
        const transaction = await this.sequelize.transaction();
        try {
            const roles = [
                { name: 'Super Admin', slug: 'superadmin', color: '#F44336' },
                { name: 'Usuario', slug: 'usuario', color: '#4CAF50' },
            ];
            for (const role of roles) {
                await role_model_1.Role.findOrCreate({
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
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error creating roles:', error);
            throw new Error('Error creating roles: ' + error.message);
        }
    }
    async seedUsers() {
        const transaction = await this.sequelize.transaction();
        try {
            const users = [
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
                const { roleSlug, password, ...rest } = user;
                rest.password = await users_model_1.Users.hashPassword(user.password);
                const roleRecord = await role_model_1.Role.findOne({
                    where: { slug: roleSlug },
                    attributes: ['id'],
                    transaction
                });
                if (roleRecord) {
                    rest.roleId = roleRecord.id;
                    await users_model_1.Users.findOrCreate({
                        where: { email: rest.email },
                        defaults: rest,
                        transaction
                    });
                }
                else {
                    console.warn(`Role with slug '${roleSlug}' not found for user ${user.email}`);
                }
            }
            await transaction.commit();
            return {
                message: 'Users created successfully',
                count: users.length
            };
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Error during complete seed process:', error);
            throw error;
        }
    }
    async seed() {
        return await this.seedAll();
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sequelize_typescript_1.Sequelize])
], SeedService);
//# sourceMappingURL=seeders.service.js.map