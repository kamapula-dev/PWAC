import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { promises as fs } from 'fs';
import * as deepl from 'deepl-node';
import { Logger } from '@nestjs/common';

@Injectable()
export class LanguagesService {
  private readonly languagesPath = path.join(process.cwd(), 'pwa-languages');

  constructor() {}

  private async readLanguageFile(
    filePath: string,
  ): Promise<Record<string, string>> {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  async getLanguages(
    language: deepl.TargetLanguageCode,
  ): Promise<Record<string, string>> {
    const filePath = path.join(this.languagesPath, `${language}.json`);
    const fallbackFilePath = path.join(this.languagesPath, 'en.json');

    try {
      return this.readLanguageFile(filePath);
    } catch {
      Logger.log(`File ${language}.json not found, falling back to en.json`);
    }

    try {
      return this.readLanguageFile(fallbackFilePath);
    } catch {
      Logger.log(`File en.json not found, falling back to en.json`);
    }
  }
}
