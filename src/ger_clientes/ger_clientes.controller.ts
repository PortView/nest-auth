import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { GerClientesService } from './ger_clientes.service';
import { error } from 'console';

@Controller('ger-clientes')
export class GerClientesController {

    constructor(private readonly gerClientesService: GerClientesService) { }

    @Get('olaMundo')
    async olaMundo(): Promise<{ message: string }> {
        return { message: "Olá mundo versão 00019 !" };
    }

    @Get('conformidades')
    async getConformidades(@Query('codimov') codimov: string, @Query('web') web: string, @Query('relatorio') relatorio: string) {
        //console.log(codimov, web, relatorio);
        const qcodimovNumber = parseInt(codimov, 10);
        const webBool = web === "true" || web === "1"; // se true mostra todos os reg.
        const relatorioBool = relatorio === 'true' || web === '1';

        if (isNaN(qcodimovNumber)) {
            throw new Error('Invalid parameters');
        }
        //console.log(qcodimovNumber, webBool, relatorioBool);
        return this.gerClientesService.getConformByUnidade(qcodimovNumber, webBool, relatorioBool);
    }

    @Get("tarefas")
    async getTarefas(@Query('codserv') codserv: string) {
        const qcodservNumber = parseInt(codserv, 10);
        if (isNaN(qcodservNumber)) {
            throw new Error('Invalid parameters');
        }
        return this.gerClientesService.getTarefas(qcodservNumber);
    }

    @Get('get-proc-ufs')
    async getUfs(@Query('codcoor') codcoor: string, @Query('codcli') codcli: string) {
        const codcoorNumber = parseInt(codcoor, 10);
        const codcliNumber = parseInt(codcli, 10);
        if (isNaN(codcoorNumber) || isNaN(codcliNumber)) {
            throw new Error('Invalid parameters');
        }
        return this.gerClientesService.getUfsByCodcoorAndCodcli(codcoorNumber, codcliNumber);
    }


    @Get("clientes")
    async getClientes(@Query('codcoor') codcoor: string) {
        const codcoorNumber = parseInt(codcoor, 10);
        if (isNaN(codcoorNumber)) {
            throw new Error('Invalid codcoor');
        }
        return this.gerClientesService.getClientesWithUfsByCodcoor(codcoorNumber);
    }

    @Get('unidades')
    async getUnidades(@Query('codcoor') codcoor: string, @Query('uf') uf: string, @Query('codcli') codcli: string) {
        const codcoorNumber = parseInt(codcoor, 10);
        const codcliNumber = parseInt(codcli, 10);
        if (isNaN(codcoorNumber) || !uf || isNaN(codcliNumber)) {
            throw new Error('Invalid parameters');
        }
        return this.gerClientesService.getUnidadesByCodcoorAndUf(codcoorNumber, uf, codcliNumber);
    }
    @Get('servicos')
    async getServicosGerenteUnidadeFiltros(
        @Query('qcodCoor') qcodCoor: string,
        @Query('qcontrato') qcontrato: string,
        @Query('qUnidade') qUnidade: string,
        @Query('qConcluido') qConcluido: string,
        @Query('qCodServ') qCodServ: string,
        @Query('qStatus') qStatus: string,
        @Query('qDtlimite') qDtlimite: string
    ) {
        const qcodCoorNumber = parseInt(qcodCoor, 10);
        const qcontratoNumber = parseInt(qcontrato, 10);
        const qUnidadeNumber = parseInt(qUnidade, 10);
        const qConcluidoBool = qConcluido === 'true';
        const qCodServNumber = parseInt(qCodServ, 10);
        const qDtlimiteDate = new Date(qDtlimite);

        if (isNaN(qcodCoorNumber) || isNaN(qcontratoNumber) || isNaN(qUnidadeNumber) || isNaN(qCodServNumber) || isNaN(qDtlimiteDate.getTime())) {
            throw new Error('Invalid parameters');
        }

        return this.gerClientesService.getServicosGerenteUnidadeFiltros(
            qcodCoorNumber,
            qcontratoNumber,
            qUnidadeNumber,
            qConcluidoBool,
            qCodServNumber,
            qStatus,
            qDtlimiteDate
        );
    }

}
