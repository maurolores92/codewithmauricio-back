import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './websocket.service';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly websocketService;
    server: Server;
    constructor(websocketService: WebsocketService);
    handleConnection(client: Socket): Promise<void>;
    handleRegisterApiKey(client: Socket, data: any): void;
    handleDisconnect(client: Socket): void;
    handlePrintConfirmation(client: Socket, data: any): void;
}
