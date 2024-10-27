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
import { BuildPWAProcessor } from './controllers/pwa-content/build-pwa.processor';

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
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: 'redis',
          port: 6379,
          password: '853c142b2f2340729557cb676258927ffb7a92c2f2b',
        },
      }),
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
