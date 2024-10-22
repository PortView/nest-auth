import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
//import { ClientesModule } from '../clientes/clientes.module';

@Module({
  //imports: [ClientesModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DbModule { }
