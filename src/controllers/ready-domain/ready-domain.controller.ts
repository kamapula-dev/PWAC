import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ReadyDomainService } from './ready-domain.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ready-domain')
export class ReadyDomainController {
  constructor(private readonly readyDomainService: ReadyDomainService) {}

  @Get()
  async getAllAvailableDomains() {
    return this.readyDomainService.getAllAvailableDomains();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/attach')
  async attachToPwa(
    @Param('id') id: string,
    @Body('pwaId') pwaId: string,
    @Body('userId') userId: string,
  ) {
    return this.readyDomainService.attachToPwa(id, pwaId, userId);
  }
}
