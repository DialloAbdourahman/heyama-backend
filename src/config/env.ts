import 'dotenv/config';

export interface EnvConfig {
  mongodbUri: string;
  port: number;
  allowedOrigins: string;
  maxImageSizeInMb: number;
  bucketName: string;
  bucketRegion: string;
  bucketEndpoint: string;
  bucketAccessKeyId: string;
  bucketSecretAccessKey: string;
  publicImageUrlPrefix: string;
}

export const env: EnvConfig = {
  mongodbUri: process.env.MONGODB_URI!,
  port: Number(process.env.PORT ?? 3000),
  maxImageSizeInMb: Number(process.env.MAX_IMAGE_SIZE_IN_MB ?? 5),
  allowedOrigins: process.env.ALLOWED_ORIGINS!,
  bucketName: process.env.BUCKET_NAME!,
  bucketRegion: process.env.BUCKET_REGION!,
  bucketEndpoint: process.env.BUCKET_ENDPOINT!,
  bucketAccessKeyId: process.env.BUCKET_ACCESS_KEY_ID!,
  bucketSecretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY!,
  publicImageUrlPrefix: process.env.PUBLIC_IMAGE_URL_PREFIX!,
};
