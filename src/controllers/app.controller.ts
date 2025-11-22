import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

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
