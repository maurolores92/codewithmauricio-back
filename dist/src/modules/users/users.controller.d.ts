import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FindAllQuerysDto } from './dto/querys.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("./users.model").Users>;
    findAll(): Promise<import("./users.model").Users[]>;
    findAllQuerys(query: FindAllQuerysDto): Promise<any>;
    findOne(id: string): Promise<import("./users.model").Users>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./users.model").Users>;
    remove(id: string): Promise<void>;
    changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<any>;
    getProfile(user: any): Promise<{
        user: {
            id: number;
            name: string;
            lastName: string;
            email: string;
            role: string | null;
        };
        delivery: boolean;
    }>;
}
