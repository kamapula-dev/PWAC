import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
import { MediaService } from '../media/media.service';
import { UserService } from '../user/user.service';
import { Logger } from '@nestjs/common';
import { PWAContentService } from './pwa-content.service';

@Processor('buildPWA')
export class BuildPWAProcessor {
  constructor(
      private readonly mediaService: MediaService,
      private readonly userService: UserService,
      private readonly pwaContentService: PWAContentService,
  ) {}

  @Process()
  async handleBuildPWAJob(job: Job) {
    try {
      const { pwaContentId, appIcon, userId } = job.data;

      Logger.log(`Job started for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`);

      const projectRoot = path.resolve(__dirname, '../../..');
      const templatePath = path.join(projectRoot, 'pwa-template');
      const tempBuildFolder = path.join(projectRoot, `temp-build-${pwaContentId}-${Date.now()}`);

      try {
        fs.mkdirSync(tempBuildFolder, { recursive: true });
        fs.cpSync(templatePath, tempBuildFolder, { recursive: true });

        const envFilePath = path.join(tempBuildFolder, '.env');
        const envContent = `
          VITE_PWA_CONTENT_ID=${pwaContentId}
          VITE_API_URL=https://pwac.world
        `;
        fs.writeFileSync(envFilePath, envContent);
        Logger.log(`.env file created at ${envFilePath}`);
      } catch (error) {
        Logger.error('Error during folder creation or file copying:', error);
        throw new Error('Failed to prepare build environment');
      }

      // Create the 'public' directory before downloading the icon
      const publicFolderPath = path.join(tempBuildFolder, 'public');
      try {
        fs.mkdirSync(publicFolderPath, { recursive: true });
        Logger.log(`Public folder created at ${publicFolderPath}`);

        // Copy the default icon from assets to public
        const assetsIconPath = path.join(templatePath, 'assets', '18.png');
        const destinationIconPath = path.join(publicFolderPath, '18.png');
        fs.copyFileSync(assetsIconPath, destinationIconPath);
        Logger.log(`Default icon copied from ${assetsIconPath} to ${destinationIconPath}`);
      } catch (error) {
        Logger.error('Error creating public folder or copying default icon:', error);
        throw new Error('Failed to create public folder or copy default icon');
      }

      const tempIconPath = path.join(publicFolderPath, `icon${path.extname(appIcon)}`);
      try {
        await this.downloadImage(appIcon, tempIconPath);
        Logger.log(`App icon downloaded and saved at ${tempIconPath}`);
      } catch (error) {
        Logger.error('Error downloading app icon:', error);
        throw new Error('Failed to download app icon');
      }

      const generateAssetsCommand = `npm run generate-pwa-assets`;
      try {
        await this.executeCommand(generateAssetsCommand, tempBuildFolder);
        Logger.log('Assets generation completed');
      } catch (error) {
        Logger.error('Error during PWA assets generation:', error);
        throw new Error('Error during PWA assets generation');
      }

      const buildCommand = `npm run build`;
      try {
        await this.executeCommand(buildCommand, tempBuildFolder);
        Logger.log('Build completed successfully');
      } catch (error) {
        Logger.error('Error during build process:', error);
        throw new Error('Error during build');
      }

      const distFolderPath = path.join(tempBuildFolder, 'dist');
      let archiveKey: string;
      let signedUrl: string;

      Logger.log('Checking for existing PWA...');
      const user = await this.userService.findById(userId);
      const existingPwa = user.pwas.find((p) => p.pwaContentId === pwaContentId);

      if (existingPwa) {
        try {
          await this.mediaService.deleteArchive(existingPwa.archiveKey);
          Logger.log(`Old archive deleted for PWA-content ID: ${pwaContentId}`);
        } catch (error) {
          Logger.error('Error deleting old archive from S3:', error);
          throw new Error('Error deleting old archive from S3');
        }
      }

      Logger.log('Uploading dist folder to S3...');
      try {
        archiveKey = await this.mediaService.uploadDistFolder(distFolderPath);
        signedUrl = await this.mediaService.getSignedUrl(archiveKey);
        Logger.log('Signed URL generated:', signedUrl);
      } catch (error) {
        Logger.error('Error during upload to S3:', error);
        throw new Error('Error during upload to S3');
      }

      await this.userService.updateUserPwas(userId, existingPwa || { pwaContentId, createdAt: new Date(), archiveKey });

      try {
        fs.rmSync(tempBuildFolder, { recursive: true, force: true });
      } catch (error) {
        Logger.error(`Error deleting temporary folder:`, error);
        throw error;
      }

      Logger.log(`Job completed for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`);
      return signedUrl;
    } catch (e) {
      throw e;
    }
  }

  private async downloadImage(url: string, filePath: string): Promise<void> {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  private async executeCommand(command: string, cwd: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Command error: ${stderr}`);
          return reject(new Error(`Command failed: ${stderr}`));
        }
        Logger.log('Command output:', stdout);
        resolve();
      });
    });
  }
}
