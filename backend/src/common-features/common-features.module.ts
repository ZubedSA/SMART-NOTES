import { Module } from '@nestjs/common';
import { CommonFeaturesController } from './common-features.controller';
import { CommonFeaturesService } from './common-features.service';

@Module({
  controllers: [CommonFeaturesController],
  providers: [CommonFeaturesService],
  exports: [CommonFeaturesService],
})
export class CommonFeaturesModule {}
