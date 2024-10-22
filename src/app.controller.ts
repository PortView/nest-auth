import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { user } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiTags('user')
  @Get('me')
  getMe(@CurrentUser() user: user) {
    return user;
  }
}
