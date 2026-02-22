import { Model } from "sequelize-typescript";
export declare class Role extends Model {
    id: number;
    name: string;
    slug: string;
    color: string;
}
