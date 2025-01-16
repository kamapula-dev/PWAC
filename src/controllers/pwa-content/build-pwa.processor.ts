import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
import { MediaService } from '../media/media.service';
import { UserService } from '../user/user.service';
import { Logger } from '@nestjs/common';
import { DomainMappingService } from '../domain-mapping/domain-mapping.service';
import { PwaStatus } from '../../schemas/user.schema';

@Processor('buildPWA')
export class BuildPWAProcessor {
  constructor(
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
    private readonly domainMappingService: DomainMappingService,
  ) {}

  @Process()
  async handleBuildPWAJob(job: Job) {
    const { pwaContentId, appIcon, userId, domain, pwaName, pixel } = job.data;

    try {
      Logger.log(
        `Job started for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`,
      );

      const projectRoot = path.resolve(__dirname, '../../..');
      const templatePath = path.join(projectRoot, 'pwa-template');
      const tempBuildFolder = path.join(projectRoot, pwaContentId);

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
        Logger.log(
          `Default icon copied from ${assetsIconPath} to ${destinationIconPath}`,
        );
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
        const rawManifest = fs.readFileSync(manifestPath, 'utf-8');
        const manifestData = JSON.parse(rawManifest);

        if (pwaName) {
          manifestData.name = pwaName;
          manifestData.short_name = pwaName;
        }

        fs.writeFileSync(
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
        const indexHtml = fs.readFileSync(indexPath, 'utf-8');
        const updatedIndexHtml = indexHtml.replace(
          /<title>.*<\/title>/,
          `<title>${pwaName}</title>`,
        );
        fs.writeFileSync(indexPath, updatedIndexHtml, 'utf-8');
        Logger.log(`Title in index.html updated to: ${pwaName}`);
      } catch (error) {
        Logger.error('Error updating title in index.html:', error);
        throw new Error('Failed to update title in index.html');
      }

      try {
        const indexHtml = fs.readFileSync(indexPath, 'utf-8');
        const pixelScript = pixel
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
              
              ${pixel}?.forEach((pixel) => {
                if (pixel.pixelId) {
                  fbq('init', pixel.pixelId);
                }
              })
            </script>`
          : `<script>
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

        fs.writeFileSync(indexPath, updatedIndexHtml, 'utf-8');
        if (pixel) {
          Logger.log(`Pixel script added with ID: ${pixel.pixelId}`);
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
      const existingPwa = user.pwas.find(
        (p) => p.pwaContentId === pwaContentId,
      );

      // only for test mode, not reproducible in the live application
      if (existingPwa) {
        try {
          if (existingPwa.archiveKey) {
            await this.mediaService.deleteArchive(existingPwa.archiveKey);
          }

          await this.userService.deleteUserPwaByContentId(
            userId,
            existingPwa.pwaContentId,
          );
          Logger.log(`Old archive deleted for PWA-content ID: ${pwaContentId}`);
        } catch (error) {
          Logger.error('Error deleting old archive from S3:', error);
          throw new Error('Error deleting old archive from S3');
        }
      }

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

      if (domain) {
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
          ]);
        }
      } else {
        await this.userService.addPwa(userId, {
          createdAt: new Date(),
          pwaContentId,
          archiveKey,
          status: PwaStatus.BUILDED,
        });
      }

      try {
        fs.rmSync(tempBuildFolder, { recursive: true, force: true });
      } catch (error) {
        Logger.error(`Error deleting temporary folder:`, error);
        throw error;
      }

      Logger.log(
        `Job completed for PWA-content ID: ${pwaContentId}, User ID: ${userId}, Job ID: ${job.id}`,
      );
      return true;
    } catch (e) {
      if (domain) {
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
            this.userService.setUserPwaStatusByDomain(
              userId,
              existingUserPwaForDomain.domainName,
              PwaStatus.BUILD_FAILED,
            ),
          ]);
        }
      }

      await this.userService.addPwa(userId, {
        createdAt: new Date(),
        pwaContentId,
        status: PwaStatus.BUILD_FAILED,
      });

      await job.moveToFailed(new Error(e), true);
      throw e;
    }
  }

  private async downloadImage(url: string, filePath: string): Promise<void> {
    const writer = fs.createWriteStream(filePath);
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
