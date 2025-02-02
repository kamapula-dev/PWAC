import { Controller, Get, Body, UseGuards, Post } from '@nestjs/common';
import { ReadyDomainService } from './ready-domain.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateReadyDomainDto } from '../../schemas/ready-domain.scheme';

@Controller('ready-domain')
export class ReadyDomainController {
  constructor(private readonly readyDomainService: ReadyDomainService) {}

  @Get()
  async getAllAvailableDomains() {
    return this.readyDomainService.getAllAvailableDomains();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createReadyDomain(
    @Body()
    createDomainDto: CreateReadyDomainDto,
  ) {
    return this.readyDomainService.createReadyDomain(createDomainDto);
  }
}
