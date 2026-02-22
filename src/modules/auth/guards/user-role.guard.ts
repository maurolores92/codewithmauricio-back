import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userRoles = user?.roles || [];
    const storeId = user?.storeId;

    // Si los roles tienen storeId, filtrar por la tienda actual
    const filteredRoles = Array.isArray(userRoles) && userRoles.length > 0 && typeof userRoles[0] === 'object'
      ? userRoles.filter((role: any) => role.storeId === storeId).map((role: any) => role.slug)
      : userRoles;

    const canAccess = this.matchRoles(filteredRoles, validRoles);
    
    return canAccess;
  }
  private matchRoles(userRoles: string[], validRoles: string[]): boolean {
    if (!validRoles || validRoles.length === 0) {
      return true; // No roles specified, allow access
    }
    return userRoles.some(role => validRoles.includes(role));
  }
}
