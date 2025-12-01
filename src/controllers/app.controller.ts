import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Public()
  @Get('health-check')
  async testDB() {
    const result = await this.appService.healthCheck();
    return result;
  }
}
