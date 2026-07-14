import { Expose, Transform } from 'class-transformer';
import { env } from 'src/config/env';

export class ImageObjectOutputDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  @Transform(({ obj }) => `${env.publicImageUrlPrefix}/${obj.imageUrl}`)
  imageUrl: string;
}
