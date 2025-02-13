import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { MediaModule } from './modules/media/media.module';
import { PWAContentModule } from './modules/pwa-content/pwa-content.module';
import { BullModule } from '@nestjs/bull';
import { DomainMappingModule } from './modules/domain-mapping/domain-mapping.module';
import { DomainManagementModule } from './modules/domain-managemant/domain-management.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { ContentGenerationModule } from './modules/content-generation/content-generation.module';
import { FacebookModule } from './modules/facebook/facebook.module';
import { PostbackModule } from './modules/postback/postback.module';
import { PWAEventLogModule } from './modules/pwa-event-log/pwa-event-log.module';
import { PWAExternalMappingModule } from './modules/pwa-external-mapping/pwa-external-mapping.module';
import { PushModule } from './modules/push/push.module';

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
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    DomainManagementModule,
    DomainMappingModule,
    MediaModule,
    PWAContentModule,
    LanguagesModule,
    ContentGenerationModule,
    PWAExternalMappingModule,
    PWAEventLogModule,
    PostbackModule,
    FacebookModule,
    PushModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
