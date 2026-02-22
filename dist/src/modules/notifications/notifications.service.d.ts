import { WebsocketService } from 'src/common/socket/websocket.service';
export declare class NotificationsService {
    private readonly websocketService;
    constructor(websocketService: WebsocketService);
    sendNotificationToAll(body: any): Promise<void>;
}
