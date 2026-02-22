import type { ModelStatic } from 'sequelize';
import { Model } from 'sequelize-typescript';
export declare abstract class CrudService<T extends Model> {
    private readonly model;
    constructor(model: ModelStatic<T>);
    create(data: any): Promise<T>;
    findAll(): Promise<T[]>;
    findOne(id: number): Promise<T>;
    update(id: number, data: Partial<T>): Promise<T>;
    delete(id: number): Promise<void>;
}
