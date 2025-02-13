import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PushService } from './push.service';
import { PushDto } from './dto/push.dto';
import { Push } from '../../schemas/push.schema';
import { AuthGuard } from '@nestjs/passport';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createPush(@Body() dto: PushDto, @Request() req): Promise<Push> {
    const userId = req.user._id;
    return this.pushService.create(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updatePush(
    @Param('id') id: string,
    @Body() dto: PushDto,
  ): Promise<Push> {
    return this.pushService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllPushes(
    @Query('active') active?: string,
    @Query('event') event?: string,
    @Query('search') search?: string,
  ): Promise<Push[]> {
    const isActive = active !== undefined ? active === 'true' : undefined;
    return this.pushService.findAll({ active: isActive, event, search });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getPush(@Param('id') id: string): Promise<Push> {
    return this.pushService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('test/:id')
  async testPush(@Param('id') id: string) {
    return this.pushService.testPush(id);
  }
}
