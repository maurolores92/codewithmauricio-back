"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainMiddleware = void 0;
const common_1 = require("@nestjs/common");
let DomainMiddleware = class DomainMiddleware {
    use(req, res, next) {
        const allowedOrigins = [
            'https://maurodev.online',
            'https://mauriciolores.com.ar',
            'https://codewithmauricio.tech',
            'http://localhost:4321',
        ];
        const origin = req.headers.origin;
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (isDevelopment) {
            return next();
        }
        if (!origin) {
            return next();
        }
        if (!allowedOrigins.includes(origin)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso no permitido desde este dominio',
            });
        }
        next();
    }
};
exports.DomainMiddleware = DomainMiddleware;
exports.DomainMiddleware = DomainMiddleware = __decorate([
    (0, common_1.Injectable)()
], DomainMiddleware);
//# sourceMappingURL=domain.middleware.js.map