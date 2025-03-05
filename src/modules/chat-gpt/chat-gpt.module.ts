import { Module } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { ChatGptController } from './chat-gpt.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ChatGptController],
  providers: [ChatGptService],
  exports: [ChatGptService, ConfigModule],
})
export class ChatGptModule {}
