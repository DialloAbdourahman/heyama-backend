import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { env } from 'src/config/env';
import { stringToArray } from 'src/common/utils/string-to-array';
import { EnumWebSocketEventType } from 'src/common/enums/web-socket-events';

@Injectable()
@WebSocketGateway({
  cors: { origin: stringToArray(env.allowedOrigins) },
  transports: ['websocket'],
})
export class WebSocketService
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  private readonly logger = new Logger(WebSocket.name);

  @WebSocketServer()
  server: Server;

  constructor() {}

  onModuleInit() {
    this.logger.log('[WebSocket] WebSocket initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`[WebSocket] Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[WebSocket] Client ${client.id} disconnected`);
  }

  broadcast<T>(event: EnumWebSocketEventType, data: T) {
    this.logger.log(`[WebSocket] Broadcasting event [${event}] to all clients`);
    this.logger.log(`[WebSocket] Payload: ${JSON.stringify(data)}`);

    this.server.emit(event, data);

    this.logger.log(`[WebSocket] Event [${event}] broadcasted successfully`);
  }
}
