import { Module } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { ChatGptController } from './chat-gpt.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ChatGptController],
  providers: [ChatGptService],
  exports: [ChatGptService],
})
export class ChatGptModule {}
