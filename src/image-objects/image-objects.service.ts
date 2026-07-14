import { Injectable, Logger } from '@nestjs/common';
import { CreateImageObjectDto } from './dto/input/create-image-object.dto';
import { AwsS3Helper } from 'src/common/backblaze/s3';
import { env } from 'src/config/env';
import { InjectModel } from '@nestjs/mongoose';
import {
  ImageObject,
  ImageObjectDocument,
} from './entities/image-object.entity';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { OrchestrationResult } from 'src/common/utils/orchestration.result';
import { EnumStatusCode } from 'src/common/enums/response-status-code';
import { ImageObjectOutputDto } from './dto/output/image-object-output.dto';
import { Pagination } from 'src/common/interfaces/pagination';
import { WebSocketService } from 'src/web-socket/web-socket-service';
import { EnumWebSocketEventType } from 'src/common/enums/web-socket-events';

@Injectable()
export class ImageObjectsService {
  private readonly logger = new Logger(ImageObjectsService.name);
  private readonly s3Helper: AwsS3Helper;

  constructor(
    @InjectModel(ImageObject.name)
    private readonly imageObjectModel: Model<ImageObjectDocument>,

    private readonly eventsGateway: WebSocketService,
  ) {
    this.s3Helper = new AwsS3Helper({
      bucketName: env.bucketName,
      bucketRegion: env.bucketRegion,
      endpoint: env.bucketEndpoint,
      accessKeyId: env.bucketAccessKeyId,
      secretAccessKey: env.bucketSecretAccessKey,
    });
  }

  async create(
    createImageObjectDto: CreateImageObjectDto,
    image: Express.Multer.File,
  ) {
    this.logger.log(`Uploading image: ${image.originalname}`);

    const fileExtension = image.originalname.split('.').pop() || 'bin';
    const key = `images/${Date.now()}.${fileExtension}`;

    await this.s3Helper.uploadImage(key, image.mimetype, image.buffer);

    this.logger.log(`Image uploaded to S3 with key: ${key}`);

    const imageObject = new this.imageObjectModel({
      ...createImageObjectDto,
      imageUrl: key,
    });

    await imageObject.save();

    this.logger.log(`Image object created in database: ${imageObject._id}`);

    const imageObjectDoc = imageObject.toObject();

    const publicImage = plainToInstance(ImageObjectOutputDto, imageObjectDoc, {
      excludeExtraneousValues: true,
    });

    try {
      this.logger.log(`Broadcasting image upload event`);
      this.eventsGateway.broadcast<ImageObjectOutputDto>(
        EnumWebSocketEventType.IMAGE_UPLOADED,
        publicImage,
      );
    } catch (error) {
      this.logger.error(`Failed to broadcast image upload: ${error.message}`);
    }

    return OrchestrationResult.Success<ImageObjectOutputDto>({
      statusCode: EnumStatusCode.CREATED_SUCCESSFULLY,
      data: publicImage,
      message: 'Image uploaded successfully',
    });
  }

  async findAll(page: number, limit: number) {
    this.logger.log(
      `[findAll] Fetching image objects - page: ${page}, limit: ${limit}`,
    );

    const filter = { deleted: false };

    const totalItems = await this.imageObjectModel.countDocuments(filter);

    const items = await this.imageObjectModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const publicImages = plainToInstance(ImageObjectOutputDto, items, {
      excludeExtraneousValues: true,
    });

    const paginatedResult: Pagination<ImageObjectOutputDto> = {
      items: publicImages,
      page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    };

    return OrchestrationResult.Success<Pagination<ImageObjectOutputDto>>({
      statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
      data: paginatedResult,
      message: 'Image objects fetched successfully',
    });
  }

  async findOne(id: string) {
    this.logger.log(`[findOne] Fetching image object with id: ${id}`);

    const imageObject = await this.imageObjectModel.findOne({
      _id: id,
      deleted: false,
    });

    if (!imageObject) {
      return OrchestrationResult.Failure<string>({
        statusCode: EnumStatusCode.NOT_FOUND,
        message: 'Image object not found',
      });
    }

    const publicImage = plainToInstance(ImageObjectOutputDto, imageObject, {
      excludeExtraneousValues: true,
    });

    return OrchestrationResult.Success<ImageObjectOutputDto>({
      statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
      data: publicImage,
      message: 'Image object fetched successfully',
    });
  }

  async remove(id: string) {
    this.logger.log(`[remove] Removing image object with id: ${id}`);

    const imageObject = await this.imageObjectModel.findOne({
      _id: id,
      deleted: false,
    });

    if (!imageObject) {
      return OrchestrationResult.Failure<string>({
        statusCode: EnumStatusCode.NOT_FOUND,
        message: 'Image object not found',
      });
    }

    this.logger.log(`[remove] Deleting image from S3: ${imageObject.imageUrl}`);
    await this.s3Helper.deleteImageFromS3(imageObject.imageUrl);
    this.logger.log(`[remove] Image deleted from S3: ${imageObject.imageUrl}`);

    imageObject.deleted = true;
    await imageObject.save();
    this.logger.log(`[remove] Image object deleted: ${imageObject._id}`);

    return OrchestrationResult.Success<null>({
      statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
      data: null,
      message: 'Image object deleted successfully',
    });
  }
}
