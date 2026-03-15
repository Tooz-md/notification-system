import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  getStatus(): object {
    return {
      status: 'online',
      timestamp: new Date(),
      projeto: 'notification-system',
    };
  }
}
