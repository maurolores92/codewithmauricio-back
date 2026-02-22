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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const role_model_1 = require("../role/role.model");
const users_model_1 = require("../users/users.model");
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async signIn(data) {
        console.log('[AUTH-SERVICE] signIn called with:', { email: data.email });
        const user = await this.usersService.findOneByEmail(data.email);
        if (!user) {
            console.error('[AUTH-SERVICE] User not found:', data.email);
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        console.log('[AUTH-SERVICE] User found:', {
            id: user.id,
            name: user.name,
            email: user.email,
            hasRole: !!user.role,
            role: user.role
        });
        const compare = await bcrypt.compare(data.password, user.password);
        if (!compare) {
            console.error('[AUTH-SERVICE] Password mismatch for:', data.email);
            throw new common_1.UnauthorizedException('Contraseña incorrecta');
        }
        console.log('[AUTH-SERVICE] Password verified successfully');
        const userInstance = await users_model_1.Users.findByPk(user.id);
        if (userInstance) {
            await userInstance.update({ lastLoginAt: new Date() });
        }
        const payload = {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
        };
        console.log('[AUTH-SERVICE] JWT payload:', payload);
        const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });
        const response = {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                role: user.role || 'usuario',
            }
        };
        console.log('[AUTH-SERVICE] Sending login response:', {
            hasToken: !!response.accessToken,
            user: response.user
        });
        return response;
    }
    async signUp(createUserDto) {
        const isUnique = await this.usersService.isUserUnique(createUserDto.email);
        if (!isUnique) {
            throw new common_1.BadRequestException("Ya existe un usuario con ese email");
        }
        const userRole = await role_model_1.Role.findOne({ where: { slug: 'usuario' } });
        if (!userRole) {
            throw new common_1.BadRequestException("No se encontró el rol de usuario");
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = await users_model_1.Users.create({
            name: createUserDto.name,
            lastName: createUserDto.lastName,
            email: createUserDto.email,
            phone: createUserDto.phone,
            password: hashedPassword,
            roleId: userRole.id,
            isActive: true,
            isVerified: false,
        });
        const payload = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });
        return {
            message: "Usuario creado exitosamente.",
            accessToken,
            user: {
                id: newUser.id,
                name: newUser.name,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: userRole.slug,
            }
        };
    }
    async me(authorization) {
        console.log('[AUTH-SERVICE] me() called');
        try {
            if (!authorization || !authorization.startsWith('Bearer ')) {
                console.error('[AUTH-SERVICE] Invalid or missing authorization header');
                throw new common_1.UnauthorizedException('Token no encontrado o inválido');
            }
            const token = authorization.split(' ')[1];
            console.log('[AUTH-SERVICE] Token extracted from header, verifying...');
            const decoded = this.jwtService.decode(token);
            if (!decoded) {
                console.error('[AUTH-SERVICE] Token decode failed');
                throw new common_1.UnauthorizedException('Token inválido');
            }
            console.log('[AUTH-SERVICE] Token decoded successfully:', {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name
            });
            const user = await users_model_1.Users.findOne({
                where: { email: decoded.email },
                attributes: { exclude: ['password'] },
                include: [{ model: role_model_1.Role }]
            });
            if (!user) {
                console.error('[AUTH-SERVICE] User not found for email:', decoded.email);
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            const result = {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role ? user.role.slug : null,
            };
            console.log('[AUTH-SERVICE] /me response:', result);
            return result;
        }
        catch (error) {
            console.error('[AUTH-SERVICE] /me error:', error.message);
            throw new common_1.UnauthorizedException('Error al procesar el token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map