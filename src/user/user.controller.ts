import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { user } from '@prisma/client';


@Controller('user')

export class UserController {
  constructor(private readonly userService: UserService) { }
  @ApiTags('user')

  //@IsPublic()
  @ApiBearerAuth()
  @Post('cadastro')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  //@ApiTags('user')
  @ApiBearerAuth()
  @Get('me')
  async getMe(@CurrentUser() user: user) {
    //return user;
    //const cod = await this.userService.getCodForUser(user.id) || 'defaultCodValue';
    const { cod, mvvm, codcargo } = await this.userService.getCodForUser(user.id) || { cod: 'defaultCodValue', mvvm: null };
    return {
      ...user,
      cod: cod,
      mvvm: mvvm,
      codcargo: codcargo,

    }
    // return {
    //   id: user.id,
    //   email: user.email,
    //   name: user.name,
    //   cod: typeof cod === 'string' ? cod : cod.cod,
    // };
  }

}