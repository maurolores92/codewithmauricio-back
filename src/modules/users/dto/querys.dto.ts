import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindAllQuerysDto extends PaginationDto {

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  roleId?: number;

}