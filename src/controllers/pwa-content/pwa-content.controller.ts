import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PWAContentService } from './pwa-content.service';
import { CreatePWAContentDto } from './dto/create-pwa-content.dto';
import { UpdatePWAContentDto } from './dto/update-pwa-content.dto';
import { PWAContent } from '../../schemas/pwa-content.scheme';
import { AuthGuard } from '@nestjs/passport';

@Controller('pwa-content')
export class PWAContentController {
  constructor(private readonly pwaContentService: PWAContentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createPWAContentDto: CreatePWAContentDto,
    @Request() req,
  ): Promise<PWAContent> {
    const userId = req.user._id;
    return this.pwaContentService.create(createPWAContentDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<PWAContent> {
    const userId = req.user._id;
    return this.pwaContentService.findOne(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Request() req): Promise<PWAContent[]> {
    const userId = req.user._id;
    return this.pwaContentService.findAll(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePWAContentDto: UpdatePWAContentDto,
    @Request() req,
  ): Promise<PWAContent> {
    const userId = req.user._id;
    return this.pwaContentService.update(id, updatePWAContentDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user._id;
    return this.pwaContentService.remove(id, userId);
  }
}
