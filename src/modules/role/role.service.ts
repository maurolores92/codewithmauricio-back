import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/common/crud/crud.service';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './role.model';
import { Op } from 'sequelize';

@Injectable()
export class RoleService extends CrudService<Role> {
  constructor(@InjectModel(Role) private readonly roleModel: typeof Role){
    super(roleModel)
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.findAll({where: {slug: {[Op.ne]: 'superadmin'}}})
  }

  async findEditableRoles(): Promise<Role[]> {
    // Solo retorna roles que se pueden editar: aquellos que NO sean 'superadmin' o 'admin'
    return this.roleModel.findAll({
      where: {
        slug: {
          [Op.notIn]: ['superadmin', 'admin']
        }
      }
    })
  }
}
