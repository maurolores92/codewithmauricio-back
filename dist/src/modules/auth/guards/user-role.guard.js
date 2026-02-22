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
exports.UserRoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let UserRoleGuard = class UserRoleGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const validRoles = this.reflector.get('roles', context.getHandler());
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const userRoles = user?.roles || [];
        const storeId = user?.storeId;
        const filteredRoles = Array.isArray(userRoles) && userRoles.length > 0 && typeof userRoles[0] === 'object'
            ? userRoles.filter((role) => role.storeId === storeId).map((role) => role.slug)
            : userRoles;
        const canAccess = this.matchRoles(filteredRoles, validRoles);
        return canAccess;
    }
    matchRoles(userRoles, validRoles) {
        if (!validRoles || validRoles.length === 0) {
            return true;
        }
        return userRoles.some(role => validRoles.includes(role));
    }
};
exports.UserRoleGuard = UserRoleGuard;
exports.UserRoleGuard = UserRoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], UserRoleGuard);
//# sourceMappingURL=user-role.guard.js.map