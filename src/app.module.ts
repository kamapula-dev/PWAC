import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './controllers/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './controllers/auth/auth.module';
import { MediaModule } from './controllers/media/media.module';
import { PWAContentModule } from './controllers/pwa-content/pwa-content.module';
import { BullModule } from '@nestjs/bull';
import * as Redis from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisClient = new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        });

        try {
          const result = await redisClient.ping();
          if (result === 'PONG') {
            console.log('Redis доступен и работает.');
          } else {
            console.log('Ответ от Redis не PONG:', result);
          }
        } catch (error) {
          console.error('Ошибка подключения к Redis:', error.message);
        }

        return {
          redis: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD'),
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    MediaModule,
    PWAContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
