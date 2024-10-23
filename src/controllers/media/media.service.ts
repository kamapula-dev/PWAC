import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fromEnv } from '@aws-sdk/credential-providers';
import * as fs from 'fs';
import * as archiver from 'archiver';
import * as path from 'path';

@Injectable()
export class MediaService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: fromEnv(),
    });
  }

  async getSignedUrl(
    fileKey: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const fileKey = `${uuidv4()}-${file.originalname}`;

      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${fileKey}`;
    });

    return Promise.all(uploadPromises);
  }

  async uploadDistFolder(distFolderPath: string): Promise<string> {
    const archiveKey = `${uuidv4()}-dist.zip`;
    const archivePath = path.join('/tmp', archiveKey);

    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise<string>((resolve, reject) => {
      output.on('close', async () => {
        const fileStream = fs.createReadStream(archivePath);
        const params = {
          Bucket: this.bucketName,
          Key: archiveKey,
          Body: fileStream,
          ContentType: 'application/zip',
        };

        const command = new PutObjectCommand(params);
        await this.s3Client.send(command);

        fs.unlinkSync(archivePath);

        resolve(archiveKey);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(distFolderPath, false);
      archive.finalize();
    });
  }
}
