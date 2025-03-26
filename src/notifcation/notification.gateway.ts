/* eslint-disable prettier/prettier */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../users/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationDocument, Notification } from './schema/notification.schema';

@WebSocketGateway({ cors: true })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private userSocketMap: Map<string, string> = new Map();

  constructor(
    private readonly userService: UserService,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        console.log(`Client ${client.id} disconnected (User ${userId} removed)`);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ): Promise<{ message: string }> {
    try {
      const objectId = new Types.ObjectId(payload.userId);
      const user = await this.userService.findById(objectId);
      if (!user) {
        console.log(`Join attempt failed: User ${payload.userId} not found`);
        void client.disconnect();
        return { message: 'User not found' };
      }

      client.join(payload.userId);
      this.userSocketMap.set(payload.userId, client.id);
      console.log(`Client ${client.id} joined room for user ${payload.userId}`);

      return { message: 'Joined successfully' };
    } catch (error) {
      console.error(`Error in handleJoin for userId "${payload.userId}":`, error);
      void client.disconnect();
      return { message: 'Invalid or non-existent user ID' };
    }
  }

  @SubscribeMessage('sendNotification')
  async handleSendNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; message: string; orgId: string; channel?: string },
  ): Promise<{ message: string }> {
    if (!payload.userId || !payload.message || !payload.orgId) {
      return { message: 'Missing userId, orgId, or message' };
    }

    // Save notification in DB
    const newNotification = new this.notificationModel({
      userId: payload.userId,
      message: payload.message,
      orgId: payload.orgId,
      channel: payload.channel || 'website',
      status: 'unread',
    });
    await newNotification.save();

    // Emit notification via WebSocket
    this.server.to(payload.userId).emit('notification', {
      notificationId: newNotification._id,
      message: newNotification.message,
      orgId: newNotification.orgId,
      channel: newNotification.channel,
      status: newNotification.status,
    });

    console.log(`Pushed notification to user ${payload.userId}`);
    return { message: 'Notification sent' };
  }

  pushNotification(userId: string, notification: any) {
    this.server.to(userId).emit('notification', notification);
    console.log(`Pushed notification to user ${userId}`);
  }
}
