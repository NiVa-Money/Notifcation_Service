/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notifcation/controllers/notification.controller';
import { NotificationService } from './notifcation/services/notification.service';
import { NotificationGateway } from './notifcation/notification.gateway';
import { NotificationSchema } from './notifcation/models/notification.model';
import { UserModule } from './users/user.module';

// Retrieve and validate the MongoDB URI
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://UATBOTWOT:b3ZBKcqZjvBnl1zZ@uat-botwot.sptr4e7.mongodb.net/botwot';;
if (!mongoUri) {
  throw new Error('MONGO_URI is not defined in your environment variables');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(mongoUri), // Now mongoUri is guaranteed to be a string
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
    UserModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
})
export class AppModule {}
