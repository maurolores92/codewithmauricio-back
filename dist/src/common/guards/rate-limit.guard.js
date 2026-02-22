"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
let RateLimitGuard = class RateLimitGuard {
    requests = {};
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
        const today = new Date().toISOString().split('T')[0];
        if (!this.requests[ip]) {
            this.requests[ip] = { count: 1, date: today };
            return true;
        }
        if (this.requests[ip].date !== today) {
            this.requests[ip] = { count: 1, date: today };
            return true;
        }
        if (this.requests[ip].count >= 3) {
            throw new common_1.HttpException('Has alcanzado el límite diario de 3 requests', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        this.requests[ip].count += 1;
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)()
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map