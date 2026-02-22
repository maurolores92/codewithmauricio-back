import { CrudService } from 'src/common/crud/crud.service';
import { Role } from './role.model';
export declare class RoleService extends CrudService<Role> {
    private readonly roleModel;
    constructor(roleModel: typeof Role);
    findAll(): Promise<Role[]>;
}
