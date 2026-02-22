import { OnModuleInit } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
export declare class WebsocketModule implements OnModuleInit {
    private readonly gateway;
    private readonly service;
    constructor(gateway: WebsocketGateway, service: WebsocketService);
    onModuleInit(): void;
}
