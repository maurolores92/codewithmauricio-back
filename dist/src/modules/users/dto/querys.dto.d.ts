import { PaginationDto } from 'src/common/dto/pagination.dto';
export declare class FindAllQuerysDto extends PaginationDto {
    search?: string;
    roleId?: number;
}
