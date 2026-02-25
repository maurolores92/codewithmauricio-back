import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['page', 'component', 'action'])
  type: 'page' | 'component' | 'action';

  @IsOptional()
  @IsString()
  resource?: string;
}