import { Test, TestingModule } from '@nestjs/testing';
import { ImageObjectsService } from './image-objects.service';

describe('ImageObjectsService', () => {
  let service: ImageObjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageObjectsService],
    }).compile();

    service = module.get<ImageObjectsService>(ImageObjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
