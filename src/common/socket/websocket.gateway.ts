import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './websocket.service';
import { WS_EVENTS } from 'src/websocket/websocket.events';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/realtime',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly websocketService: WebsocketService) {}

  async handleConnection(client: Socket) {
    client.emit(WS_EVENTS.WELCOME, { message: 'Conexion exitosa al WebSocket' });
  }
  
  @SubscribeMessage(WS_EVENTS.REGISTER_API_KEY)
  handleRegisterApiKey(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const apiKey = data.apiKey;
    this.websocketService.registerClient(client, apiKey);
    console.log(`🔑 Cliente ${client.id} registrado con apiKey: ${apiKey}`);
  }

  @SubscribeMessage(WS_EVENTS.REGISTER_USER)
  handleRegisterUser(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const userId = Number(data?.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      client.emit('error', { message: 'userId invalido para registro websocket' });
      return;
    }

    this.websocketService.registerUserClient(client, userId);
    client.emit('registered_user', { userId });
    console.log(`👤 Cliente ${client.id} registrado con userId: ${userId}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Cliente desconectado: ${client.id}`);
    this.websocketService.unregisterClient(client);
  }

  @SubscribeMessage(WS_EVENTS.PRINT_CONFIRMATION)
  handlePrintConfirmation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log(`✅ Confirmación de impresión recibida de ${client.id}:`, data);
  }
}
