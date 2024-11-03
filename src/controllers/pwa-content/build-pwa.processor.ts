import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { MediaService } from '../media/media.service';
import { UserService } from '../user/user.service';
import { Logger } from '@nestjs/common';

@Processor('buildPWA')
export class BuildPWAProcessor {
  constructor(
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
  ) {}

  @Process()
  async handleBuildPWAJob(job: Job) {
    try {
      const { pwaContentId, userId } = job.data;

      Logger.log(
        `Job started for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`,
      );

      const projectRoot = path.resolve(__dirname, '../../..');
      const templatePath = path.join(projectRoot, 'pwa-template');
      const tempBuildFolder = path.join(
        projectRoot,
        `temp-build-${pwaContentId}-${Date.now()}`,
      );

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

      const buildCommand = `VITE_PWA_CONTENT_ID=${pwaContentId} npm run build`;

      try {
        await new Promise<void>((resolve, reject) => {
          exec(
            buildCommand,
            { cwd: tempBuildFolder },
            (error, stdout, stderr) => {
              if (error) {
                Logger.error(`Build error: ${stderr}`);
                return reject(new Error(`Error during build: ${stderr}`));
              }

              Logger.log('Build output:', stdout);
              resolve();
            },
          );
        });
      } catch (error) {
        Logger.error('Error during build process:', error);
        throw new Error('Error during build');
      }

      const distFolderPath = path.join(tempBuildFolder, 'dist');
      let archiveKey: string;
      let signedUrl: string;

      Logger.log('Checking for existing PWA...');

      const user = await this.userService.findById(userId);
      const existingPwa = user.pwas.find(
        (p) => p.pwaContentId === pwaContentId,
      );

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
        Logger.log('Dist folder uploaded');
        signedUrl = await this.mediaService.getSignedUrl(archiveKey);
        Logger.log('Signed URL generated:', signedUrl);
      } catch (error) {
        Logger.error('Error during upload to S3:', error);
        throw new Error('Error during upload to S3');
      }

      await this.userService.updateUserPwas(
        userId,
        existingPwa || {
          pwaContentId,
          createdAt: new Date(),
          archiveKey,
        },
      );

      try {
        fs.rmSync(tempBuildFolder, { recursive: true, force: true });
      } catch (error) {
        Logger.error(`Error deleting temporary folder:`, error);
        throw error;
      }

      Logger.log(
        `Job completed for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`,
      );

      return signedUrl;
    } catch (e) {
      throw e;
    }
  }
}
