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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const websocket_service_1 = require("./websocket.service");
let WebsocketGateway = class WebsocketGateway {
    websocketService;
    server;
    constructor(websocketService) {
        this.websocketService = websocketService;
    }
    async handleConnection(client) {
        client.emit('welcome', { message: 'Conexión exitosa al WebSocket' });
    }
    handleRegisterApiKey(client, data) {
        const apiKey = data.apiKey;
        this.websocketService.registerClient(client, apiKey);
        console.log(`🔑 Cliente ${client.id} registrado con apiKey: ${apiKey}`);
    }
    handleDisconnect(client) {
        console.log(`🔴 Cliente desconectado: ${client.id}`);
        this.websocketService.unregisterClient(client);
    }
    handlePrintConfirmation(client, data) {
        console.log(`✅ Confirmación de impresión recibida de ${client.id}:`, data);
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register_api_key'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleRegisterApiKey", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('print_confirmation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handlePrintConfirmation", null);
exports.WebsocketGateway = WebsocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/realtime',
    }),
    __metadata("design:paramtypes", [websocket_service_1.WebsocketService])
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map