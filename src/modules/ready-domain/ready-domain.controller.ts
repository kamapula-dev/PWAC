import {
  Controller,
  Get,
  Body,
  UseGuards,
  Post,
  Request,
} from '@nestjs/common';
import { ReadyDomainService } from './ready-domain.service';
import { AuthGuard } from '@nestjs/passport';
import { ProcessDomainDto } from '../../schemas/ready-domain.scheme';

@Controller('ready-domain')
export class ReadyDomainController {
  constructor(private readonly readyDomainService: ReadyDomainService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllAvailableDomains(@Request() req) {
    return this.readyDomainService.getAllAvailableDomains(req.user._id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('process')
  async processDomain(@Body() processDomainDto: ProcessDomainDto) {
    return this.readyDomainService.processDomain(
      processDomainDto.cloudflare,
      processDomainDto.domain,
      processDomainDto.userEmail,
    );
  }
}
