
import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';
import { CLOUDINARY } from "@core/const/app.const";


export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (config: ConfigService) => {
    return v2.config({
      cloud_name: config.get('cloudinaryCloudName'),
      api_key: config.get('cloudinaryApiKey'),
      api_secret: config.get('cloudinaryApiSecret'),
    });
  },
  inject: [ConfigService],
};
