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
import { DomainMappingModule } from './controllers/domain-mapping/domain-mapping.module';
import { DomainManagementModule } from './controllers/domain-managemant/domain-management.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
