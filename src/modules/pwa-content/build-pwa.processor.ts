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
import { PushService } from '../push/push.service';
import { ConfigService } from '@nestjs/config';

const execAsync = promisify(exec);

@Processor('buildPWA')
export class BuildPWAProcessor {
  private readonly logger = new Logger(BuildPWAProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
    private readonly domainMappingService: DomainMappingService,
    private readonly pwaEventLogService: PWAEventLogService,
    private readonly pwaExternalMappingService: PWAExternalMappingService,
    private readonly domainManagementService: DomainManagementService,
    private readonly readyDomainService: ReadyDomainService,
    private readonly pushService: PushService,
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
      theme,
      hasLoadingScreen,
      offerPreloader,
    } = job.data;

    let tempBuildFolder: string;

    try {
      this.logger.log(
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
          VITE_API_URL=${this.configService.get<string>('VITE_API_URL')}
          VITE_APP_API_KEY=${this.configService.get<string>('VITE_APP_API_KEY')}
          VITE_APP_AUTH_DOMAIN=${this.configService.get<string>('VITE_APP_AUTH_DOMAIN')}
          VITE_APP_PROJECT_ID=${this.configService.get<string>('VITE_APP_PROJECT_ID')}
          VITE_APP_STORAGE_BUCKET=${this.configService.get<string>('VITE_APP_STORAGE_BUCKET')}
          VITE_APP_MESSAGING_SENDER_ID=${this.configService.get<string>('VITE_APP_MESSAGING_SENDER_ID')}
          VITE_APP_APP_ID=${this.configService.get<string>('VITE_APP_APP_ID')}
          VITE_APP_MEASUREMENT_ID=${this.configService.get<string>('VITE_APP_MEASUREMENT_ID')}
          VITE_APP_VAPID_KEY=${this.configService.get<string>('VITE_APP_VAPID_KEY')}
        `;
        await fse.writeFile(envFilePath, envContent);
        this.logger.log(`.env file created at ${envFilePath}`);
      } catch (error) {
        this.logger.error(
          'Error during folder creation or file copying:',
          error,
        );
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

        // Create firebase-messaging-sw.js
        const serviceWorkerPath = path.join(
          publicFolderPath,
          'firebase-messaging-sw.js',
        );
        const serviceWorkerContent = `
            self.addEventListener('push', function(event) {
            if (!event.data) return;
          
            const payload = event.data.json();
            console.log('Push Received:', payload);
          
            const notificationOptions = {
              body: payload.notification.body,
              icon: payload.data?.icon,
              badge: payload.data?.badge,
              image: payload.notification.image,
              data: {
                url: payload.data?.url || 'https://${domain}'
              }
            };
          
            event.waitUntil(
              self.registration.showNotification(
                payload.notification.title,
                notificationOptions
              )
            );
          });
          
          self.addEventListener('notificationclick', function(event) {
            event.notification.close();
            
            const url = event.notification.data.url || '/';
            console.log('Opening URL:', url);
          
            event.waitUntil(
              clients.matchAll({type: 'window', includeUncontrolled: true})
                .then(windowClients => {
                  const client = windowClients.find(client => 
                    client.url === url && 'focus' in client
                  );
                  
                  if (client) {
                    return client.focus();
                  }
                  return clients.openWindow(url);
                })
                .catch(error => {
                  console.error('Open window error:', error);
                  return clients.openWindow(url);
                })
            );
          });
        `;
        await fse.writeFile(serviceWorkerPath, serviceWorkerContent);
      } catch (error) {
        this.logger.error('Error creating public folder structure:', error);
        throw new Error('Failed to create public folder structure');
      }

      // Download app icon
      try {
        const tempIconPath = path.join(
          publicFolderPath,
          `icon${path.extname(appIcon)}`,
        );
        await this.downloadImage(appIcon, tempIconPath);
        this.logger.log(`App icon downloaded to ${tempIconPath}`);
      } catch (error) {
        this.logger.error('Error downloading app icon:', error);
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

        manifestData.background_color = offerPreloader.background;

        await fse.writeJson(manifestPath, manifestData, { spaces: 2 });
        this.logger.log(`Manifest updated with name: ${pwaName}`);
      } catch (error) {
        this.logger.error('Error updating manifest.json:', error);
        throw new Error('Failed to update manifest.json');
      }

      try {
        const indexPath = path.join(tempBuildFolder, 'index.html');
        let indexHtml = await fse.readFile(indexPath, 'utf-8');

        indexHtml = indexHtml.replace(
          /<title>.*<\/title>/,
          `<title>${pwaName}</title>`,
        );

        const pixelArrayString = JSON.stringify(pixel || []);
        const pixelScript = pixel?.length
          ? this.generatePixelScriptWithArray(pixelArrayString)
          : this.generatePixelScriptWithQueryParam();

        indexHtml = indexHtml.replace('</head>', `${pixelScript}</head>`);

        const preloaderCode = `
              <style>
                  .preloader {
                      position: fixed;
                      top: 0;
                      left: 0;
                      right: 0;
                      width: 100%;
                      height: 100%;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      z-index: 9999;
                      transition: background-color 0.3s ease;
                  }
                  .preloader {
                      background-color: ${!theme?.auto && theme?.dark ? '#131313' : 'white'};
                  }
                  @media (prefers-color-scheme: dark) {
                      .preloader {
                          background-color: ${theme?.auto ? '#131313' : ''};
                      }
                  }
                  .google-icon {
                      width: 125px;
                      height: 137px;
                      animation: pulse 1.5s ease-in-out infinite;
                  }
                  @keyframes pulse {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.05); }
                  }
              </style>
            
             ${
               hasLoadingScreen
                 ? `<div class="preloader" id="preloader">
                        <svg class="google-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <path fill="none" d="M0,0h40v40H0V0z"></path>
                            <g>
                                <path d="M19.7,19.2L4.3,35.3c0,0,0,0,0,0c0.5,1.7,2.1,3,4,3c0.8,0,1.5-0.2,2.1-0.6l0,0l17.4-9.9L19.7,19.2z" fill="#EA4335"></path>
                                <path d="M35.3,16.4L35.3,16.4l-7.5-4.3l-8.4,7.4l8.5,8.3l7.5-4.2c1.3-0.7,2.2-2.1,2.2-3.6C37.5,18.5,36.6,17.1,35.3,16.4z" fill="#FBBC04"></path>
                                <path d="M4.3,4.7C4.2,5,4.2,5.4,4.2,5.8v28.5c0,0.4,0,0.7,0.1,1.1l16-15.7L4.3,4.7z" fill="#4285F4"></path>
                                <path d="M19.8,20l8-7.9L10.5,2.3C9.9,1.9,9.1,1.7,8.3,1.7c-1.9,0-3.6,1.3-4,3c0,0,0,0,0,0L19.8,20z" fill="#34A853"></path>
                            </g>
                        </svg>
                    </div>`
                 : ''
             } 
            `;

        indexHtml = indexHtml.replace('</html>', `${preloaderCode}</html>`);

        await fse.writeFile(indexPath, indexHtml, 'utf-8');
        this.logger.log('Index.html updated successfully');
      } catch (error) {
        this.logger.error('Error updating index.html:', error);
        throw new Error('Failed to update index.html');
      }

      // Execute build commands
      try {
        await this.executeCommand(
          'npm run generate-pwa-assets',
          tempBuildFolder,
        );
        await this.executeCommand('npm run build', tempBuildFolder);
        this.logger.log('Build completed successfully');
      } catch (error) {
        this.logger.error('Build process failed:', error);
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
        this.logger.log(`Upload to S3 completed. Archive key: ${archiveKey}`);
      } catch (error) {
        this.logger.error('S3 upload failed:', error);
        throw new Error('S3 upload failed');
      }

      // Cleanup
      try {
        await fse.remove(tempBuildFolder);
        this.logger.log(`Temporary directory cleaned: ${tempBuildFolder}`);
      } catch (error) {
        this.logger.error('Cleanup failed:', error);
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

      this.logger.log(
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
              fbq('track', 'PageView');
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
          this.pushService.updatePwaIdByDomain(
            userId,
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
    this.logger.error(`Job failed: ${error.message}`, error.stack);

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
          this.pushService.updatePwaIdByDomain(
            userId,
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
      if (stderr) this.logger.warn(`Command stderr: ${stderr}`);
      this.logger.log(`Command output: ${stdout}`);
    } catch (error) {
      this.logger.error(`Command failed: ${error.stderr}`);
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }
}
