export interface AuditOptions {
    entityType: string;
    action: 'create' | 'edit' | 'remove' | 'open' | 'close';
    getEntityId?: (result: any, body: any) => number;
    getDescription?: (result: any, body: any, user: any) => string;
}
export declare const AUDIT_METADATA = "audit_metadata";
export declare const Audit: (options: AuditOptions) => import("@nestjs/common").CustomDecorator<string>;
