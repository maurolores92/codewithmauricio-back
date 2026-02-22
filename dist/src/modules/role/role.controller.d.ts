import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    create(createRoleDto: CreateRoleDto): Promise<import("./role.model").Role>;
    findAll(): Promise<import("./role.model").Role[]>;
    findOne(id: string): Promise<import("./role.model").Role>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<import("./role.model").Role>;
    remove(id: string): Promise<void>;
}
