import { Test, TestingModule } from '@nestjs/testing';
import { ImageObjectsController } from './image-objects.controller';
import { ImageObjectsService } from './image-objects.service';

describe('ImageObjectsController', () => {
  let controller: ImageObjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageObjectsController],
      providers: [ImageObjectsService],
    }).compile();

    controller = module.get<ImageObjectsController>(ImageObjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
