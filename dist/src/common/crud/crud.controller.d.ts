import { CrudService } from './crud.service';
import { Model } from 'sequelize-typescript';
export declare abstract class CrudController<T extends Model> {
    private readonly service;
    constructor(service: CrudService<T>);
    getAll(): Promise<T[]>;
    getById(id: number): Promise<T>;
    create(body: any): Promise<any>;
    update(id: number, body: Partial<T>): Promise<T>;
    remove(id: string): Promise<any>;
}
