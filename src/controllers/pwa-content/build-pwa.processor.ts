import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { MediaService } from '../media/media.service';
import { UserService } from '../user/user.service';

@Processor('buildPWA')
export class BuildPWAProcessor {
  constructor(
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
  ) {
    console.log('MediaService:', !!mediaService);
    console.log('UserService:', !!userService);
  }

  @Process()
  async handleBuildPWAJob(job: Job) {
    try {
      const { pwaId, userId } = job.data;

      console.log(
        `Job started for PWA ID: ${pwaId}, User ID: ${userId}, Job ID: ${job.id}`,
      );

      const projectRoot = path.resolve(__dirname, '../../..');
      const templatePath = path.join(projectRoot, 'pwa-template');
      const tempBuildFolder = path.join(
        projectRoot,
        `temp-build-${pwaId}-${Date.now()}`,
      );

      try {
        fs.mkdirSync(tempBuildFolder, { recursive: true });
        fs.cpSync(templatePath, tempBuildFolder, { recursive: true });
      } catch (error) {
        console.error('Error during folder creation or file copying:', error);
        throw new Error('Failed to prepare build environment');
      }

      const buildCommand = `PWA_CONTENT_ID=${pwaId} npm run build`;

      console.log(35);

      try {
        await new Promise<void>((resolve, reject) => {
          exec(
            buildCommand,
            { cwd: tempBuildFolder },
            (error, stdout, stderr) => {
              if (error) {
                console.error(`Build error: ${stderr}`);
                return reject(new Error(`Error during build: ${stderr}`));
              }
              console.log('Build output:', stdout);
              resolve();
            },
          );
        });
        console.log(52);
      } catch (error) {
        console.error('Error during build process:', error);
        throw new Error('Error during build');
      }
      console.log(56);
      const distFolderPath = path.join(tempBuildFolder, 'dist');
      let archiveKey: string;
      let signedUrl: string;
      console.log(60);
      console.log('Uploading dist folder to S3...');
      try {
        archiveKey = await this.mediaService.uploadDistFolder(distFolderPath);
        console.log('Dist folder uploaded, archiveKey:', archiveKey);
        signedUrl = await this.mediaService.getSignedUrl(archiveKey);
        console.log('Signed URL generated:', signedUrl);
      } catch (error) {
        console.error('Error during upload to S3:', error);
        throw new Error('Error during upload to S3');
      }

      const pwaData = {
        pwaId,
        url: signedUrl,
        createdAt: new Date(),
        archiveKey,
      };
      await this.userService.addPwa(userId, pwaData);

      try {
        fs.rmSync(tempBuildFolder, { recursive: true, force: true });
      } catch (error) {
        console.error(`Error deleting temporary folder:`, error);
        throw error;
      }

      console.log(
        `Job completed for PWA ID: ${pwaId}, User ID: ${userId}, Job ID: ${job.id}`,
      );

      return signedUrl;
    } catch (e) {
      throw e;
    }
  }
}
