import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { fromEnv } from '@aws-sdk/credential-providers';

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
}
