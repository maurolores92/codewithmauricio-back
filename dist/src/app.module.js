"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const post_module_1 = require("./modules/post/post.module");
const ai_module_1 = require("./ai/ai.module");
const ai_service_1 = require("./ai/ai.service");
const domain_middleware_1 = require("./common/middleware/domain.middleware");
const websocket_module_1 = require("./common/socket/websocket.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const auth_module_1 = require("./modules/auth/auth.module");
const seeders_module_1 = require("./modules/seeders/seeders.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(domain_middleware_1.DomainMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            database_module_1.DatabaseModule,
            post_module_1.PostModule,
            ai_module_1.AiModule,
            websocket_module_1.WebsocketModule,
            notifications_module_1.NotificationsModule,
            auth_module_1.AuthModule,
            seeders_module_1.SeedModule,
        ],
        providers: [ai_service_1.AiService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map