"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const audit_decorator_1 = require("../decorators/audit.decorator");
let AuditInterceptor = class AuditInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const auditOptions = this.reflector.get(audit_decorator_1.AUDIT_METADATA, context.getHandler());
        if (!auditOptions) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const body = request.body;
        const ipAddress = request.ip;
        const userAgent = request.headers['user-agent'];
        if (!user || !user.id) {
            console.warn('Audit interceptor: User not found in request');
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.tap)(async (result) => {
            try {
                let entityId = null;
                if (auditOptions.getEntityId) {
                    entityId = auditOptions.getEntityId(result, body);
                }
                else {
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
                console.log(`Audit log: ${description}`, {
                    entityType: auditOptions.entityType,
                    entityId,
                    action: auditOptions.action,
                    userId: user.id,
                    ipAddress,
                    userAgent,
                });
                console.log(`Audit log created: ${description}`);
            }
            catch (error) {
                console.error('Error creating audit log:', error);
            }
        }));
    }
    generateDefaultDescription(options, result, body) {
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
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map