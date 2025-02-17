import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import * as fse from 'fs-extra';
import { MediaService } from '../media/media.service';
import { UserService } from '../user/user.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DomainMappingService } from '../domain-mapping/domain-mapping.service';
import { PwaStatus } from '../../schemas/user.schema';
import { PWAEventLogService } from '../pwa-event-log/pwa-event-log.service';
import { PWAExternalMappingService } from '../pwa-external-mapping/pwa-external-mapping.service';
import { DomainManagementService } from '../domain-managemant/domain-management.service';
import { ReadyDomainService } from '../ready-domain/ready-domain.service';

const execAsync = promisify(exec);

@Processor('buildPWA')
export class BuildPWAProcessor {
  constructor(
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
    private readonly domainMappingService: DomainMappingService,
    private readonly pwaEventLogService: PWAEventLogService,
    private readonly pwaExternalMappingService: PWAExternalMappingService,
    private readonly domainManagementService: DomainManagementService,
    private readonly readyDomainService: ReadyDomainService,
  ) {}

  @Process()
  async handleBuildPWAJob(job: Job) {
    const {
      pwaContentId,
      appIcon,
      userId,
      domain,
      deploy,
      gApiKey,
      email,
      readyDomainId,
      pwaName,
      pixel,
    } = job.data;

    let tempBuildFolder: string;

    try {
      Logger.log(
        `Job started for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`,
      );

      const projectRoot = path.resolve(__dirname, '../../..');
      const templatePath = path.join(projectRoot, 'pwa-template');
      tempBuildFolder = path.join(projectRoot, pwaContentId);

      try {
        // Create temp directory and copy template
        await fse.emptyDir(tempBuildFolder);
        await fse.copy(templatePath, tempBuildFolder);

        // Create .env file
        const envFilePath = path.join(tempBuildFolder, '.env');
        const envContent = `
          VITE_PWA_CONTENT_ID=${pwaContentId}
          VITE_API_URL=https://pwac.world
          VITE_APP_API_KEY=AIzaSyDrnHccHsbP1qexi0TPW0wt5dw95QB6SYQ
          VITE_APP_AUTH_DOMAIN=pwac-f4fa7.firebaseapp.com
          VITE_APP_PROJECT_ID=pwac-f4fa7
          VITE_APP_STORAGE_BUCKET=pwac-f4fa7.firebasestorage.app
          VITE_APP_MESSAGING_SENDER_ID=1082672576795
          VITE_APP_APP_ID=1:1082672576795:web:da0be39788c3431bd4bbbe
          VITE_APP_MEASUREMENT_ID=G-PQN430W6DQ
          VITE_APP_VAPID_KEY=BK_A7jh_hRtPuk_AmQIUSGsZS96du-BvCMKbKuI9Lk7-zImex-Zxlqv7T_Y5bEKNPyiERktNCnkjkEX-rFXRthQ
        `;
        await fse.writeFile(envFilePath, envContent);
        Logger.log(`.env file created at ${envFilePath}`);
      } catch (error) {
        Logger.error('Error during folder creation or file copying:', error);
        throw new Error('Failed to prepare build environment');
      }

      const publicFolderPath = path.join(tempBuildFolder, 'public');

      try {
        await fse.ensureDir(publicFolderPath);

        // Copy default icon
        const assetsIconPath = path.join(templatePath, 'assets', '18.png');
        const destinationIconPath = path.join(publicFolderPath, '18.png');
        await fse.copy(assetsIconPath, destinationIconPath);

        // Create .well-known directory with assetlinks.json
        const wellKnownFolder = path.join(publicFolderPath, '.well-known');
        await fse.ensureDir(wellKnownFolder);

        const assetLinksPath = path.join(wellKnownFolder, 'assetlinks.json');
        const assetLinksContent = [
          {
            relation: ['delegate_permission/common.handle_all_urls'],
            target: {
              namespace: 'web',
              site: `https://${domain}/`,
            },
          },
        ];
        await fse.writeJson(assetLinksPath, assetLinksContent, { spaces: 2 });
      } catch (error) {
        Logger.error('Error creating public folder structure:', error);
        throw new Error('Failed to create public folder structure');
      }

      // Download app icon
      try {
        const tempIconPath = path.join(
          publicFolderPath,
          `icon${path.extname(appIcon)}`,
        );
        await this.downloadImage(appIcon, tempIconPath);
        Logger.log(`App icon downloaded to ${tempIconPath}`);
      } catch (error) {
        Logger.error('Error downloading app icon:', error);
        throw new Error('Failed to download app icon');
      }

      // Update manifest.json
      try {
        const manifestPath = path.join(tempBuildFolder, 'manifest.json');
        const manifestData = await fse.readJson(manifestPath);

        if (pwaName) {
          manifestData.name = pwaName;
          manifestData.short_name = pwaName;
        }

        manifestData.related_applications = [
          {
            platform: 'webapp',
            url: `https://${domain}/manifest.webmanifest`,
          },
        ];

        await fse.writeJson(manifestPath, manifestData, { spaces: 2 });
        Logger.log(`Manifest updated with name: ${pwaName}`);
      } catch (error) {
        Logger.error('Error updating manifest.json:', error);
        throw new Error('Failed to update manifest.json');
      }

      // Update index.html
      try {
        const indexPath = path.join(tempBuildFolder, 'index.html');
        let indexHtml = await fse.readFile(indexPath, 'utf-8');

        // Update title
        indexHtml = indexHtml.replace(
          /<title>.*<\/title>/,
          `<title>${pwaName}</title>`,
        );

        // Add pixel script
        const pixelArrayString = JSON.stringify(pixel || []);
        const pixelScript = pixel?.length
          ? this.generatePixelScriptWithArray(pixelArrayString)
          : this.generatePixelScriptWithQueryParam();

        indexHtml = indexHtml.replace('</head>', `${pixelScript}</head>`);
        await fse.writeFile(indexPath, indexHtml, 'utf-8');

        Logger.log(`Index.html updated successfully`);
      } catch (error) {
        Logger.error('Error updating index.html:', error);
        throw new Error('Failed to update index.html');
      }

      // Execute build commands
      try {
        await this.executeCommand(
          'npm run generate-pwa-assets',
          tempBuildFolder,
        );
        await this.executeCommand('npm run build', tempBuildFolder);
        Logger.log('Build completed successfully');
      } catch (error) {
        Logger.error('Build process failed:', error);
        throw new Error('Build process failed');
      }

      // Upload to S3
      const distFolderPath = path.join(tempBuildFolder, 'dist');
      let archiveKey: string;

      try {
        archiveKey = await this.mediaService.uploadDistFolder(
          distFolderPath,
          pwaContentId,
        );
        Logger.log(`Upload to S3 completed. Archive key: ${archiveKey}`);
      } catch (error) {
        Logger.error('S3 upload failed:', error);
        throw new Error('S3 upload failed');
      }

      // Cleanup
      try {
        await fse.remove(tempBuildFolder);
        Logger.log(`Temporary directory cleaned: ${tempBuildFolder}`);
      } catch (error) {
        Logger.error('Cleanup failed:', error);
      }

      // Domain handling and user updates
      await this.handleDomainAndUserUpdates(
        deploy,
        userId,
        pwaContentId,
        archiveKey,
        domain,
        readyDomainId,
        email,
        gApiKey,
      );

      Logger.log(
        `Job completed for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`,
      );
      return true;
    } catch (error) {
      await this.handleJobError(
        error,
        job,
        deploy,
        userId,
        pwaContentId,
        domain,
        readyDomainId,
        email,
        gApiKey,
      );
      throw error;
    }
  }

  private generatePixelScriptWithArray(pixelArrayString: string): string {
    return `
      <script>
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          
          ${pixelArrayString}.forEach((item) => {
            if(item.pixelId) {
              fbq('init', item.pixelId);
            }
          });
      </script>`;
  }

  private generatePixelScriptWithQueryParam(): string {
    return `
      <script>
        function getQueryParam(param) {
          var searchParams = new URLSearchParams(window.location.search);
          return searchParams.get(param);
        }
        var pixelId = getQueryParam("idpixel");
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
      
        if(pixelId) {
          fbq("init", pixelId);
        }
        fbq("track", "PageView");
      </script>`;
  }

  private async handleDomainAndUserUpdates(
    deploy: boolean,
    userId: string,
    pwaContentId: string,
    archiveKey: string,
    domain: string,
    readyDomainId: string,
    email: string,
    gApiKey: string,
  ): Promise<void> {
    const isOwnDomainValuesPresent = email && gApiKey && domain;

    if (deploy && (readyDomainId || isOwnDomainValuesPresent)) {
      await this.userService.addPwa(userId, {
        createdAt: new Date(),
        pwaContentId,
        archiveKey,
        status: PwaStatus.BUILDED,
      });

      if (readyDomainId) {
        await this.readyDomainService.attachToPwa(
          readyDomainId,
          pwaContentId,
          userId,
        );
      } else {
        if (!isOwnDomainValuesPresent) {
          throw new HttpException(
            'Missing required parameters',
            HttpStatus.BAD_REQUEST,
          );
        }

        await this.domainManagementService.addDomain(
          email,
          gApiKey,
          domain,
          pwaContentId,
          userId,
        );
      }
    } else {
      const user = await this.userService.findById(userId);
      const existingUserPwaForDomain = user.pwas.find(
        (p) => p.domainName === domain,
      );
      const existingDomainMapping =
        await this.domainMappingService.getMappingByDomain(domain);

      if (existingDomainMapping && existingUserPwaForDomain) {
        await Promise.all([
          this.domainMappingService.updateDomainMappingPwaId(
            userId,
            existingUserPwaForDomain.domainName,
            pwaContentId,
          ),
          this.userService.setUserPwaId(
            userId,
            existingUserPwaForDomain.domainName,
            pwaContentId,
            archiveKey,
          ),
          this.pwaEventLogService.setPwaContentIdByDomain(
            existingUserPwaForDomain.domainName,
            pwaContentId,
          ),
          this.pwaExternalMappingService.setPwaContentIdByDomain(
            existingUserPwaForDomain.domainName,
            pwaContentId,
          ),
          this.userService.setUserPwaStatusByDomain(
            userId,
            existingUserPwaForDomain.domainName,
            PwaStatus.ACTIVE,
          ),
        ]);
      }
    }
  }

  private async handleJobError(
    error: Error,
    job: Job,
    deploy: boolean,
    userId: string,
    pwaContentId: string,
    domain: string,
    readyDomainId: string,
    email: string,
    gApiKey: string,
  ): Promise<void> {
    Logger.error(`Job failed: ${error.message}`, error.stack);

    const isOwnDomainValuesPresent = email && gApiKey && domain;

    if (deploy && (readyDomainId || isOwnDomainValuesPresent)) {
      await this.userService.addPwa(userId, {
        createdAt: new Date(),
        pwaContentId,
        status: PwaStatus.BUILD_FAILED,
      });

      if (readyDomainId) {
        await this.readyDomainService.attachToPwa(
          readyDomainId,
          pwaContentId,
          userId,
        );
      } else {
        if (!isOwnDomainValuesPresent) {
          throw new HttpException(
            'Missing required parameters',
            HttpStatus.BAD_REQUEST,
          );
        }

        await this.domainManagementService.addDomain(
          email,
          gApiKey,
          domain,
          pwaContentId,
          userId,
        );
      }
    } else {
      const user = await this.userService.findById(userId);
      const existingUserPwaForDomain = user.pwas.find(
        (p) => p.domainName === domain,
      );
      const existingDomainMapping =
        await this.domainMappingService.getMappingByDomain(domain);

      if (existingDomainMapping && existingUserPwaForDomain) {
        await Promise.all([
          this.domainMappingService.updateDomainMappingPwaId(
            userId,
            existingUserPwaForDomain.domainName,
            pwaContentId,
          ),
          this.userService.setUserPwaId(
            userId,
            existingUserPwaForDomain.domainName,
            pwaContentId,
          ),
          this.pwaEventLogService.setPwaContentIdByDomain(
            existingUserPwaForDomain.domainName,
            pwaContentId,
          ),
          this.pwaExternalMappingService.setPwaContentIdByDomain(
            existingUserPwaForDomain.domainName,
            pwaContentId,
          ),
          this.userService.setUserPwaStatusByDomain(
            userId,
            existingUserPwaForDomain.domainName,
            PwaStatus.BUILD_FAILED,
          ),
        ]);
      }
    }

    await job.moveToFailed({ message: error.message }, true);
  }

  private async downloadImage(url: string, filePath: string): Promise<void> {
    const writer = fse.createWriteStream(filePath);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  private async executeCommand(command: string, cwd: string): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
      if (stderr) Logger.warn(`Command stderr: ${stderr}`);
      Logger.log(`Command output: ${stdout}`);
    } catch (error) {
      Logger.error(`Command failed: ${error.stderr}`);
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }
}
