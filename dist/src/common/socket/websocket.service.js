"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketService = void 0;
const common_1 = require("@nestjs/common");
let WebsocketService = class WebsocketService {
    server;
    clients = new Map();
    apiKeyClients = new Map();
    setServer(server) {
        this.server = server;
    }
    registerClient(client, apiKey) {
        this.clients.set(client.id, client);
        if (apiKey) {
            if (!this.apiKeyClients.has(apiKey)) {
                this.apiKeyClients.set(apiKey, new Set());
            }
            this.apiKeyClients.get(apiKey).add(client.id);
            client.apiKey = apiKey;
        }
    }
    unregisterClient(client) {
        this.clients.delete(client.id);
        const apiKey = client.apiKey;
        if (apiKey && this.apiKeyClients.has(apiKey)) {
            this.apiKeyClients.get(apiKey).delete(client.id);
        }
    }
    emitToApiKey(apiKey, event, payload) {
        const clientIds = this.apiKeyClients.get(apiKey);
        if (!clientIds)
            return;
        for (const clientId of clientIds) {
            const client = this.clients.get(clientId);
            if (client)
                client.emit(event, payload);
        }
    }
    emitToAll(event, payload) {
        this.server.emit(event, payload);
    }
};
exports.WebsocketService = WebsocketService;
exports.WebsocketService = WebsocketService = __decorate([
    (0, common_1.Injectable)()
], WebsocketService);
//# sourceMappingURL=websocket.service.js.map