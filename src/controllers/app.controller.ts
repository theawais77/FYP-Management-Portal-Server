import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Public()
  @Get()
  async testDB() {
    const result = await this.appService.testDB();
    return result;
  }
  @Get('users')
  async getAllUsers() {
    return this.appService.getAllUsers();
  }
}
