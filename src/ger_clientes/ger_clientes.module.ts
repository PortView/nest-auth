import { Module } from '@nestjs/common';
import { GerClientesController } from './ger_clientes.controller';
import { GerClientesService } from './ger_clientes.service';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  controllers: [GerClientesController],
  providers: [GerClientesService, PrismaService]
})
export class GerClientesModule { }
