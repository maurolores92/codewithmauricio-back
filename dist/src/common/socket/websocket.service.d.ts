import { Server, Socket } from 'socket.io';
export declare class WebsocketService {
    private server;
    private clients;
    private apiKeyClients;
    setServer(server: Server): void;
    registerClient(client: Socket, apiKey?: string): void;
    unregisterClient(client: Socket): void;
    emitToApiKey(apiKey: string, event: string, payload: any): void;
    emitToAll(event: string, payload: any): void;
}
