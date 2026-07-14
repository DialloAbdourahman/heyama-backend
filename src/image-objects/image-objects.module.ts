import { Module } from '@nestjs/common';
import { ImageObjectsService } from './image-objects.service';
import { ImageObjectsController } from './image-objects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageObject, ImageObjectSchema } from './entities/image-object.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ImageObject.name, schema: ImageObjectSchema },
    ]),
  ],
  controllers: [ImageObjectsController],
  providers: [ImageObjectsService],
})
export class ImageObjectsModule {}
