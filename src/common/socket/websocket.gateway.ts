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
    client.emit('welcome', { message: 'Conexión exitosa al WebSocket'});
  }
  
  @SubscribeMessage('register_api_key')
  handleRegisterApiKey(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const apiKey = data.apiKey;
    this.websocketService.registerClient(client, apiKey);
    console.log(`🔑 Cliente ${client.id} registrado con apiKey: ${apiKey}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Cliente desconectado: ${client.id}`);
    this.websocketService.unregisterClient(client);
  }

  @SubscribeMessage('print_confirmation')
  handlePrintConfirmation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log(`✅ Confirmación de impresión recibida de ${client.id}:`, data);
  }
}
