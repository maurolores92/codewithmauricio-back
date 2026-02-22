// src/common/decorators/audit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export interface AuditOptions {
  entityType: string;
  action: 'create' | 'edit' | 'remove' | 'open' | 'close';
  getEntityId?: (result: any, body: any) => number;
  getDescription?: (result: any, body: any, user: any) => string;
}

export const AUDIT_METADATA = 'audit_metadata';
export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_METADATA, options);