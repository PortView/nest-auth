import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { user } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private appService: AppService) { }

  @ApiBearerAuth()
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiTags('user')
  @ApiBearerAuth()
  @Get('me')
  getMe(@CurrentUser() user: user) {
    return user;
  }
}
