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

    console.log('[UserRoleGuard] Validating access:', {
      requiredRoles: validRoles,
      userIsAdmin: user?.isAdmin,
      userRole: user?.role,
      userId: user?.id
    });

    // Si no hay roles especificados, permitir acceso
    if (!validRoles || validRoles.length === 0) {
      console.log('[UserRoleGuard] No roles required, allowing access');
      return true;
    }

    // Si el usuario tiene isAdmin y los roles requeridos incluyen 'admin'
    if (user?.isAdmin && validRoles.includes('admin')) {
      console.log('[UserRoleGuard] User is admin, allowing access');
      return true;
    }

    // Si el usuario tiene un rol específico que coincide con los roles requeridos
    const userRole = user?.role;
    if (userRole && validRoles.includes(userRole)) {
      console.log('[UserRoleGuard] User role matches, allowing access');
      return true;
    }

    console.log('[UserRoleGuard] Access denied');
    return false;
  }
}
