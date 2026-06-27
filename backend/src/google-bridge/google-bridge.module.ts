import { Module, Global } from '@nestjs/common';
import { GoogleBridgeService } from './google-bridge.service';

@Global()
@Module({
  providers: [GoogleBridgeService],
  exports: [GoogleBridgeService],
})
export class GoogleBridgeModule {}
