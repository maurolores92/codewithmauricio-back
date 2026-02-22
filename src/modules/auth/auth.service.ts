import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { SignInAuthDto } from "./dto/signIn-auth.dto";
import { RegisterDto } from "../users/dto/register.dto";
import { Role } from "../role/role.model";
import { Users } from "../users/users.model";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }
  
  async signIn(data: SignInAuthDto): Promise<any> {
    console.log('[AUTH-SERVICE] signIn called with:', { email: data.email });
    
    const user = await this.usersService.findOneByEmail(data.email);
    
    if (!user) {
      console.error('[AUTH-SERVICE] User not found:', data.email);
      throw new UnauthorizedException('Usuario no encontrado');
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
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    console.log('[AUTH-SERVICE] Password verified successfully');

    // Actualizar último login
    const userInstance = await Users.findByPk(user.id);
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
    
    async signUp(createUserDto: RegisterDto): Promise<any> {
      // Verificar si el email ya existe
      const isUnique = await this.usersService.isUserUnique(createUserDto.email);
      if (!isUnique) {
        throw new BadRequestException("Ya existe un usuario con ese email");
      }
      
      // Buscar el rol "usuario" por defecto
      const userRole = await Role.findOne({ where: { slug: 'usuario' } });
      if (!userRole) {
        throw new BadRequestException("No se encontró el rol de usuario");
      }
      
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      // Crear nuevo usuario
      const newUser = await Users.create({
        name: createUserDto.name,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        phone: createUserDto.phone,
        password: hashedPassword,
        roleId: userRole.id,
        isActive: true,
        isVerified: false,
      } as any);
      
      // Generar token JWT
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

  async me(authorization: string | undefined): Promise<any> {
    console.log('[AUTH-SERVICE] me() called');
    
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        console.error('[AUTH-SERVICE] Invalid or missing authorization header');
        throw new UnauthorizedException('Token no encontrado o inválido');
      }
      
      const token = authorization.split(' ')[1];
      console.log('[AUTH-SERVICE] Token extracted from header, verifying...');
      
      const decoded = this.jwtService.decode(token);
      
      if (!decoded) {
        console.error('[AUTH-SERVICE] Token decode failed');
        throw new UnauthorizedException('Token inválido');
      }
      
      console.log('[AUTH-SERVICE] Token decoded successfully:', {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      });
      
      const user = await Users.findOne({
        where: { email: decoded.email },
        attributes: { exclude: ['password'] },
        include: [{ model: Role }]
      });

      if (!user) {
        console.error('[AUTH-SERVICE] User not found for email:', decoded.email);
        throw new UnauthorizedException('Usuario no encontrado');
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
    } catch (error) {
      console.error('[AUTH-SERVICE] /me error:', error.message);
      throw new UnauthorizedException('Error al procesar el token');
    }
  }
}
