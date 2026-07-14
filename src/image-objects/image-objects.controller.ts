import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ImageObjectsService } from './image-objects.service';
import { CreateImageObjectDto } from './dto/input/create-image-object.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { env } from 'src/config/env';

@Controller('image-objects')
export class ImageObjectsController {
  constructor(private readonly imageObjectsService: ImageObjectsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateImageObjectDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: env.maxImageSizeInMb * 1024 * 1024,
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.imageObjectsService.create(dto, image);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.imageObjectsService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.imageObjectsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageObjectsService.remove(id);
  }
}
