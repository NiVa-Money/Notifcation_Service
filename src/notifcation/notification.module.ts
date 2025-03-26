/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../notifcation/schema/notification.schema';
import { NotificationService } from '../notifcation/services/notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
