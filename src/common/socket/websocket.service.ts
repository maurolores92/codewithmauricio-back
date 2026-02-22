
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  private server: Server;
  private clients: Map<string, Socket> = new Map();
  private apiKeyClients: Map<string, Set<string>> = new Map();

  setServer(server: Server) {
    this.server = server;
  }

  registerClient(client: Socket, apiKey?: string) {
    this.clients.set(client.id, client);
    if (apiKey) {
      if (!this.apiKeyClients.has(apiKey)) {
        this.apiKeyClients.set(apiKey, new Set());
      }
      this.apiKeyClients.get(apiKey)!.add(client.id);
      (client as any).apiKey = apiKey;
    }
  }

  unregisterClient(client: Socket) {
    this.clients.delete(client.id);
    const apiKey = (client as any).apiKey;
    if (apiKey && this.apiKeyClients.has(apiKey)) {
      this.apiKeyClients.get(apiKey)!.delete(client.id);
    }
  }

  emitToApiKey(apiKey: string, event: string, payload: any) {
    const clientIds = this.apiKeyClients.get(apiKey);
    if (!clientIds) return;
    for (const clientId of clientIds) {
      const client = this.clients.get(clientId);
      if (client) client.emit(event, payload);
    }
  }

  emitToAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }

}
