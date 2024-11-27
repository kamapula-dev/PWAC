import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { promises as fs } from 'fs';
import * as deepl from 'deepl-node';
import * as appRoot from 'app-root-path';

@Injectable()
export class LanguagesService {
  private readonly languagesPath = path.join(appRoot.path, 'pwa-languages');

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
      return await this.readLanguageFile(filePath);
    } catch {
      console.log(`File ${language}.json not found, falling back to en.json`);
    }

    try {
      return await this.readLanguageFile(fallbackFilePath);
    } catch {
      console.log(`File en.json not found, falling back to en.json`);
    }
  }
}
