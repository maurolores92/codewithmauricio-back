import { ValidRoles } from '../interfaces/valid-roles';
export declare function Auth(...roles: ValidRoles[]): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
