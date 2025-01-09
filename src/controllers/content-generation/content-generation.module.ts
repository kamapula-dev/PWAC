import { Module } from '@nestjs/common';
import { ContentGenerationService } from './content-generation.service';
import { ContentGenerationController } from './content-generation.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ContentGenerationController],
  providers: [ContentGenerationService],
})
export class ContentGenerationModule {}
