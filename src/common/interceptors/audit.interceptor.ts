// src/common/interceptors/audit.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// import { AuditLogService } from '../../app/audit-log/audit-log.service';
import { AUDIT_METADATA, AuditOptions } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    // private auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_METADATA,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    // Verificar que el usuario esté autenticado
    if (!user || !user.id) {
      console.warn('Audit interceptor: User not found in request');
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (result) => {
        try {
          // Determinar entityId con múltiples fallbacks
          let entityId: number | null = null;
          
          if (auditOptions.getEntityId) {
            entityId = auditOptions.getEntityId(result, body);
          } else {
            // Fallbacks automáticos
            const id = result?.id || body?.id || request.params?.id;
            entityId = id ? Number(id) : null;
          }

          if (!entityId) {
            console.warn('Audit interceptor: Could not determine entity ID');
            return;
          }

          const description = auditOptions.getDescription
            ? auditOptions.getDescription(result, body, user)
            : this.generateDefaultDescription(auditOptions, result, body);

          // TODO: Implement audit log service
          console.log(`Audit log: ${description}`, {
            entityType: auditOptions.entityType,
            entityId,
            action: auditOptions.action,
            userId: user.id,
            ipAddress,
            userAgent,
          });

          // await this.auditLogService.createLog({
          //   entityType: auditOptions.entityType,
          //   entityId: Number(entityId),
          //   action: auditOptions.action,
          //   description,
          //   oldValues: auditOptions.action === 'edit' ? body.oldValues : undefined,
          //   newValues: auditOptions.action !== 'remove' ? result : undefined,
          //   userId: user.id,
          //   storeId: user.storeId || null,
          //   ipAddress,
          //   userAgent,
          // });

          console.log(`Audit log created: ${description}`);
        } catch (error) {
          console.error('Error creating audit log:', error);
        }
      }),
    );
  }

  private generateDefaultDescription(options: AuditOptions, result: any, body: any): string {
    const entityName = result?.name || body?.name || `ID ${result?.id || body?.id}`;
    const actions = {
      create: 'creado',
      edit: 'editado',
      remove: 'eliminado',
      open: 'abierto',
      close: 'cerrado'
    };
    
    return `${options.entityType} "${entityName}" ${actions[options.action]}`;
  }
}