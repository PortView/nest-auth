import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  // create(createUserDto: CreateUserDto) {
  //   return createUserDto;
  // }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const data: Prisma.userCreateInput = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    };

    const createdUser = await this.prisma.user.create({ data });

    return {
      ...createdUser,
      password: undefined,
    };
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // async getCodForUser(id: number) {
  //   return await this.prisma.user.findUnique({ where: { id } });
  // }

  async getCodForUser(id: number): Promise<{ cod: number | null, mvvm: string | null, codcargo: number | null, }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { ass: true }
    });

    return {
      cod: user ? user.cod : null,
      mvvm: user && user.ass ? String(user.ass.mvvm) : null,
      codcargo: user && user.ass ? Number(user.ass.codcargo) : null,
    };
  }
}