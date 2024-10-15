import { PartialType } from '@nestjs/mapped-types';
import { CreatePWAContentDto } from './create-pwa-content.dto';

export class UpdatePWAContentDto extends PartialType(CreatePWAContentDto) {}
