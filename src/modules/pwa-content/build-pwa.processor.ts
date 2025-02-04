import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { exec } from 'child_process';
import axios from 'axios';
import { MediaService } from '../media/media.service';
import { UserService } from '../user/user.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DomainMappingService } from '../domain-mapping/domain-mapping.service';
import { PwaStatus } from '../../schemas/user.schema';
import { PWAEventLogService } from '../pwa-event-log/pwa-event-log.service';
import { PWAExternalMappingService } from '../pwa-external-mapping/pwa-external-mapping.service';
import { DomainManagementService } from '../domain-managemant/domain-management.service';
import { ReadyDomainService } from '../ready-domain/ready-domain.service';

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

  private async copyDir(src: string, dest: string): Promise<void> {
    const entries = await fs.readdir(src, { withFileTypes: true });
    await fs.mkdir(dest, { recursive: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

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

    try {
      Logger.log(
        `Job started for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`,
      );

      const projectRoot = path.resolve(__dirname, '../../..');
      const templatePath = path.join(projectRoot, 'pwa-template');
      const tempBuildFolder = path.join(projectRoot, pwaContentId);

      try {
        await fs.mkdir(tempBuildFolder, { recursive: true });
        await this.copyDir(templatePath, tempBuildFolder);

        const envFilePath = path.join(tempBuildFolder, '.env');
        const envContent = `
          VITE_PWA_CONTENT_ID=${pwaContentId}
          VITE_API_URL=https://pwac.world
        `;
        await fs.writeFile(envFilePath, envContent);
        Logger.log(`.env file created at ${envFilePath}`);
      } catch (error) {
        Logger.error('Error during folder creation or file copying:', error);
        throw new Error('Failed to prepare build environment');
      }

      const publicFolderPath = path.join(tempBuildFolder, 'public');

      try {
        await fs.mkdir(publicFolderPath, { recursive: true });
        Logger.log(`Public folder created at ${publicFolderPath}`);

        const assetsIconPath = path.join(templatePath, 'assets', '18.png');
        const destinationIconPath = path.join(publicFolderPath, '18.png');
        await fs.copyFile(assetsIconPath, destinationIconPath);
        Logger.log(
          `Default icon copied from ${assetsIconPath} to ${destinationIconPath}`,
        );

        const wellKnownFolder = path.join(publicFolderPath, '.well-known');
        const assetLinksPath = path.join(wellKnownFolder, 'assetlinks.json');

        try {
          await fs.mkdir(wellKnownFolder, { recursive: true });
          const assetLinksContent = [
            {
              relation: ['delegate_permission/common.handle_all_urls'],
              target: {
                namespace: 'web',
                site: `https://${domain}/`,
              },
            },
          ];
          await fs.writeFile(
            assetLinksPath,
            JSON.stringify(assetLinksContent, null, 2),
          );
          Logger.log(`assetlinks.json created at ${assetLinksPath}`);
        } catch (error) {
          Logger.error('Error creating assetlinks.json:', error);
          throw new Error('Failed to create assetlinks.json');
        }
      } catch (error) {
        Logger.error(
          'Error creating public folder or copying default icon:',
          error,
        );
        throw new Error('Failed to create public folder or copy default icon');
      }

      const tempIconPath = path.join(
        publicFolderPath,
        `icon${path.extname(appIcon)}`,
      );
      try {
        await this.downloadImage(appIcon, tempIconPath);
        Logger.log(`App icon downloaded and saved at ${tempIconPath}`);
      } catch (error) {
        Logger.error('Error downloading app icon:', error);
        throw new Error('Failed to download app icon');
      }

      try {
        const manifestPath = path.join(tempBuildFolder, 'manifest.json');
        const rawManifest = await fs.readFile(manifestPath, 'utf-8');
        const manifestData = JSON.parse(rawManifest);

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

        await fs.writeFile(
          manifestPath,
          JSON.stringify(manifestData, null, 2),
          'utf-8',
        );
        Logger.log(`Manifest updated with new name: ${pwaName}`);
      } catch (error) {
        Logger.error('Error updating manifest.json:', error);
        throw new Error('Failed to update manifest.json');
      }

      const indexPath = path.join(tempBuildFolder, 'index.html');

      try {
        const indexHtml = await fs.readFile(indexPath, 'utf-8');
        const updatedIndexHtml = indexHtml.replace(
          /<title>.*<\/title>/,
          `<title>${pwaName}</title>`,
        );
        await fs.writeFile(indexPath, updatedIndexHtml, 'utf-8');
        Logger.log(`Title in index.html updated to: ${pwaName}`);
      } catch (error) {
        Logger.error('Error updating title in index.html:', error);
        throw new Error('Failed to update title in index.html');
      }

      try {
        const indexHtml = await fs.readFile(indexPath, 'utf-8');
        const pixelArrayString = JSON.stringify(pixel || []);

        const pixelScript = pixel?.length
          ? `
            <script>
              !(function (f, b, e, v, n, t, s) {
                if (f.fbq) return;
                n = f.fbq = function () {
                  n.callMethod
                    ? n.callMethod.apply(n, arguments)
                    : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = !0;
                n.version = "2.0";
                n.queue = [];
                t = b.createElement(e);
                t.async = !0;
                t.src = v;
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
              })(
                window,
                document,
                "script",
                "https://connect.facebook.net/en_US/fbevents.js"
              );
              
              ${pixelArrayString}.forEach((item) => {
                if (item.pixelId) {
                  fbq('init', item.pixelId);
                }
              });
            </script>`
          : `
            <script>
              function getQueryParam(param) {
                var searchParams = new URLSearchParams(window.location.search);
                return searchParams.get(param);
              }
              var pixelId = getQueryParam("idpixel");
              !(function (f, b, e, v, n, t, s) {
                if (f.fbq) return;
                n = f.fbq = function () {
                  n.callMethod
                    ? n.callMethod.apply(n, arguments)
                    : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = !0;
                n.version = "2.0";
                n.queue = [];
                t = b.createElement(e);
                t.async = !0;
                t.src = v;
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
              })(
                window,
                document,
                "script",
                "https://connect.facebook.net/en_US/fbevents.js"
              );
          
              if (pixelId) {
                fbq("init", pixelId);
              }
          
              fbq("track", "PageView");
            </script>
          `;

        const updatedIndexHtml = indexHtml.replace(
          '</head>',
          `${pixelScript}</head>`,
        );

        await fs.writeFile(indexPath, updatedIndexHtml, 'utf-8');

        if (pixel?.length) {
          Logger.log(
            `Pixel script added. Pixel array: ${JSON.stringify(pixel)}`,
          );
        } else {
          Logger.log(`Pixel script added query params`);
        }
      } catch (error) {
        Logger.error('Error updating index.html with Pixel ID:', error);
        throw new Error('Failed to update index.html with Pixel ID');
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

      Logger.log('Checking for existing PWA...');

      const user = await this.userService.findById(userId);

      Logger.log('Uploading dist folder to S3...');

      try {
        archiveKey = await this.mediaService.uploadDistFolder(
          distFolderPath,
          pwaContentId,
        );
      } catch (error) {
        Logger.error('Error during upload to S3:', error);
        throw new Error('Error during upload to S3');
      }

      try {
        await fs.rm(tempBuildFolder, { recursive: true, force: true });
      } catch (error) {
        Logger.error(`Error deleting temporary folder:`, error);
        throw error;
      }

      if (deploy) {
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
          if (!(email && gApiKey && domain)) {
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

      Logger.log(
        `Job completed for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`,
      );
      return true;
    } catch (e) {
      if (deploy) {
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
          if (!(email && gApiKey && domain)) {
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

      await job.moveToFailed(new Error(e), true);

      throw e;
    }
  }

  private async downloadImage(url: string, filePath: string): Promise<void> {
    const writer = createWriteStream(filePath);
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
