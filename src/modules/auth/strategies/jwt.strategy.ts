import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { UsersService } from '../../users/users.service';
import { Users } from 'src/modules/users/users.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService
  ) {
    const secretOrKey = process.env.JWT_SECRET_KEY;
    if (!secretOrKey) {
      throw new Error('JWT secret key is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(data: JwtPayload): Promise<any> {
    console.log('[JWT-STRATEGY] validate() called with payload:', data);
    
    try {
      const user = await this.usersService.findOneByEmail(data.email);
      console.log('[JWT-STRATEGY] User found from email:', {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        createdByAdminId: user.createdByAdminId,
        role: user.role
      });
      
      return user;
    } catch (error) {
      console.error('[JWT-STRATEGY] User not found or error:', error.message);
      throw new UnauthorizedException('User not found');
    }
  }
}
