import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signIn-auth.dto';
import type { Request } from 'express';
import { RegisterDto } from '../users/dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getMe(req: Request): Promise<any>;
    signIn(signInDto: SignInAuthDto): Promise<any>;
    signUp(signUpDto: RegisterDto): Promise<any>;
}
