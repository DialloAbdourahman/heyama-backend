import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';

export class AwsS3Helper {
  private readonly s3: S3Client;
  private readonly logger = new Logger(AwsS3Helper.name);

  constructor(
    private readonly config: {
      bucketName: string;
      bucketRegion: string;
      endpoint: string;
      accessKeyId: string;
      secretAccessKey: string;
    },
  ) {
    this.s3 = new S3Client({
      endpoint: config.endpoint,
      region: config.bucketRegion,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Recommended for Backblaze
    });
  }

  async uploadImage(
    key: string,
    contentType: string,
    file: Buffer,
  ): Promise<void> {
    this.logger.log(
      `[uploadImage] Uploading image with key=${key}, contentType=${contentType}`,
    );

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    this.logger.log(
      `[uploadImage] Successfully uploaded image with key=${key}`,
    );
  }

  async deleteImageFromS3(key: string): Promise<void> {
    this.logger.log(`[deleteImageFromS3] Deleting image with key=${key}`);

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      }),
    );

    this.logger.log(
      `[deleteImageFromS3] Successfully deleted image with key=${key}`,
    );
  }
}
