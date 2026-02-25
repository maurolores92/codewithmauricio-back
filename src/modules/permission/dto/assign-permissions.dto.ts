// filepath: /mnt/MauroLP/Proyectos/codewithmauricio/back/src/modules/permission/dto/assign-permissions.dto.ts
import { IsArray, IsNumber } from 'class-validator';

export class AssignPermissionsDto {
  @IsNumber()
  roleId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}