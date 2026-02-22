import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { SignInAuthDto } from "./dto/signIn-auth.dto";
import { RegisterDto } from "../users/dto/register.dto";
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    signIn(data: SignInAuthDto): Promise<any>;
    signUp(createUserDto: RegisterDto): Promise<any>;
    me(authorization: string | undefined): Promise<any>;
}
