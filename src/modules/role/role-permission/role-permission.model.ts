
import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Role } from '../role.model';
import { Permission } from 'src/modules/permission/permission.model';

@Table({ timestamps: false, tableName: 'role_permissions' })
export class RolePermission extends Model {
  @ForeignKey(() => Role)
  @Column
  roleId: number;

  @ForeignKey(() => Permission)
  @Column
  permissionId: number;
}