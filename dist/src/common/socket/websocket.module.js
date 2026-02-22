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
exports.WebsocketModule = void 0;
const common_1 = require("@nestjs/common");
const websocket_gateway_1 = require("./websocket.gateway");
const websocket_service_1 = require("./websocket.service");
let WebsocketModule = class WebsocketModule {
    gateway;
    service;
    constructor(gateway, service) {
        this.gateway = gateway;
        this.service = service;
    }
    onModuleInit() {
        this.service.setServer(this.gateway.server);
    }
};
exports.WebsocketModule = WebsocketModule;
exports.WebsocketModule = WebsocketModule = __decorate([
    (0, common_1.Module)({
        providers: [websocket_gateway_1.WebsocketGateway, websocket_service_1.WebsocketService],
        exports: [websocket_service_1.WebsocketService],
    }),
    __metadata("design:paramtypes", [websocket_gateway_1.WebsocketGateway,
        websocket_service_1.WebsocketService])
], WebsocketModule);
//# sourceMappingURL=websocket.module.js.map