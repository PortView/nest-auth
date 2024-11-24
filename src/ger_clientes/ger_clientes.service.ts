import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class GerClientesService {
    constructor(private prisma: PrismaService) { }


    // async getConformByUnidadeX(codimov: number, web: boolean, rel: boolean) {
    //     const result = await this.prisma.cad_conform.findMany({
    //         where: {
    //             codimov: codimov,
    //             //...(web === false ? { f_internet: web } : {}),
    //             //...(rel ? { f_relatorio: rel } : {}),
    //         },
    //         select: {
    //             cod: true,
    //             codimov: true,
    //             codcfor: true,
    //             // descr: true,
    //             // doc: true,
    //             // area: true,
    //             dt: true,
    //             // dtvenc: true,
    //             // providencia: true,
    //             // quando: true,
    //             // quem: true,
    //             // grupo: true,
    //             // dtaviso: true,
    //             // atividade: true,
    //             // docscanv: true,
    //             // docscani: true,
    //             // qtdedoc: true,
    //             // qlocal: true,
    //             f_internet: true,
    //             // terceiros: true,
    //             // cad: true,
    //             // arq_morto: true,
    //             // cnpj_conform: true,
    //             // old_cnpj: true,
    //             // periodocidade: true,
    //             // grau_risco: true,
    //             // obs: true,
    //             f_relatorio: true,
    //             // dt_renov: true,
    //             // f_obs: true,
    //             // cod_gp_depto: true,
    //             // v_grau_risco: true,
    //             // val_trib: true,
    //             // doc_original: true,
    //             // dt_doc_original: true,
    //             // codusu_doc_orig: true,
    //             // doc_original_ok: true,
    //             // dt_doc_original_ok: true,
    //             // codusu_doc_orig_ok: true,
    //             // dt_ins: true,
    //             // doc_permanente: true,
    //             // statusconform: true,
    //             // dtstatusconform: true,
    //             // codstatusconform: true,
    //             // orgao_publico: true,
    //             // orientacao: true,
    //             // gestao_cli: true,
    //             // respons_terceiro: true,
    //             // dt_recebe: true,
    //             // dt_input: true,
    //             // flag_tipopdf: true,
    //         },
    //         orderBy: {
    //             codcfor: 'asc',
    //             //dt: 'asc',
    //         },

    //     });

    //     return result;
    // }



    async getConformByUnidade(codimov: number, web: boolean, rel: boolean) {

        const baseQuery = `SELECT cod, codimov, codcfor, dt, f_internet, f_relatorio
                FROM modulo.cad_conform WHERE codimov = \$1`;

        var fullQuery = "";

        if (web === false) {
            fullQuery = ` and f_internet = true`;
        }
        if (rel === true) {
            fullQuery += ` and f_relatorio = true`;
        }

        fullQuery = `${baseQuery} ${fullQuery} ORDER BY codcfor ASC, dt ASC NULLS FIRST`;

        // const fullQuery = web === false
        //     ? `${baseQuery} ORDER BY codcfor ASC, dt ASC NULLS FIRST`
        //     : `${baseQuery} AND f_internet = true ORDER BY codcfor ASC, dt ASC NULLS FIRST`;

        // const fullQuery2 = rel === false
        //     ? `${baseQuery} ORDER BY codcfor ASC, dt ASC NULLS FIRST`
        //     : `${baseQuery} AND f_internet = true ORDER BY codcfor ASC, dt ASC NULLS FIRST`;
        // console.log('Param Web:', web);
        // console.log('Param Rel:', rel);
        // console.log('Full query:', fullQuery);

        const result = await this.prisma.$queryRawUnsafe(fullQuery, codimov);
        return result;

    }



    async getUfsByCodcoorAndCodcli(codcoor: number, codcli: number) {
        //console.log(`Este é o codcoor: ${codcoor}, e o codcli: ${codcli}`);
        const result = await this.prisma.$queryRawUnsafe(`SELECT * FROM modulo.ger_get_ufs(${codcoor}, ${codcli})`);
        return result;
    }

    async getClientesWithUfsByCodcoor(codcoor: number) {
        //console.log(`Fetching folowup records for codcoor: ${codcoor}`);
        const folowups = await this.prisma.folowup.findMany({
            where: {
                codcoor: codcoor,
            },
            select: {
                codcli: true,
                codend: true,
            },
        });

        //console.log('Folowup records:', folowups);

        const codcliList = folowups.map(f => f.codcli);
        const codendList = folowups.map(f => f.codend);

        //console.log('Codcli list:', codcliList);
        //console.log('Codend list:', codendList);

        const clientes = await this.prisma.cadcli.findMany({
            where: {
                cod: { in: codcliList },
            },
            select: {
                cod: true,
                fantasia: true,
            },
            orderBy: {
                fantasia: 'asc',
            },
        });

        //console.log('Clientes:', clientes);

        const imoveis = await this.prisma.cadimov.findMany({
            where: {
                cod: { in: codendList },
            },
            select: {
                codcli: true,
                uf: true,
            },
        });

        //console.log('Imoveis:', imoveis);

        // const clientesComUfs = clientes.map(cliente => {
        //     const ufs = imoveis
        //         .filter(imovel => imovel.codcli === cliente.cod)
        //         .map(imovel => imovel.uf)
        //         .filter((value, index, self) => self.indexOf(value) === index)
        //         .sort();

        //     return {
        //         codcli: cliente.cod,
        //         fantasia: cliente.fantasia.trim(),
        //         w_ufs: ufs,
        //     };
        // });

        const clientesComUfs = clientes.map(cliente => {
            const ufs = imoveis
                .filter(imovel => imovel.codcli === cliente.cod)
                .map(imovel => imovel.uf)
                .filter((value, index, self) => self.indexOf(value) === index)
                .sort()
                .map(uf => ({ uf })); // Transforma cada UF em um objeto

            return {
                codcli: cliente.cod,
                fantasia: cliente.fantasia, // Removido o .trim() para manter os espaços
                lc_ufs: ufs,
            };
        });

        //console.log('Clientes com UFs:', clientesComUfs);

        return clientesComUfs;
    }

    async getUnidadesByCodcoorAndUf_xxx(codcoor: number, uf: string, codend: number) {
        //console.log(`Fetching folowup records for codcoor: ${codcoor}, uf: ${uf}, codend: ${codend}`);

        const folowups = await this.prisma.folowup.findMany({
            where: {
                codcoor: codcoor,
                cadimov: {
                    uf: uf,
                    cod: codend, // Certifique-se de que o campo correto está sendo usado
                },
            },
            select: {
                contrato: true,
                codend: true,
                cadimov: {
                    select: {
                        tipo: true,
                    },
                },
            },
            orderBy: {
                cadimov: {
                    tipo: 'asc',
                },
            },
        });

        //console.log('Folowup records:', folowups);

        // Remover duplicatas de 'tipo'
        const uniqueResults = [];
        const seenTipos = new Set();

        for (const folowup of folowups) {
            const tipo = folowup.cadimov?.tipo;
            if (tipo && !seenTipos.has(tipo)) {
                seenTipos.add(tipo);
                uniqueResults.push({
                    contrato: folowup.contrato,
                    codend: folowup.codend,
                    tipo: tipo,
                });
            }
        }

        //console.log('Unique results:', uniqueResults);

        return uniqueResults;
    }

    async getUnidadesByCodcoorAndUf(codcoor: number, uf: string, codcli: number, page: number = 1): Promise<any> {
        const whereClause: any = {
            codcoor: codcoor,
            codcli: codcli,
            cadimov: {},
        };

        if (uf !== 'ZZ') {
            whereClause.cadimov.uf = uf;
        }

        const itemsPerPage = 100;
        const skip = (page - 1) * itemsPerPage;

        // Consulta para obter os registros distintos de codend
        const distinctCodend = await this.prisma.folowup.findMany({
            where: whereClause,
            select: {
                codend: true,
            },
            distinct: ['codend'],
        });

        // Contar o número total de registros distintos
        const totalCount = distinctCodend.length;

        // Consulta para obter os registros paginados
        const folowups = await this.prisma.folowup.findMany({
            where: whereClause,
            select: {
                contrato: true,
                codend: true,
                cadimov: {
                    select: {
                        tipo: true,
                    },
                },
            },
            orderBy: {
                cadimov: {
                    tipo: 'asc',
                },
            },
            distinct: ['codend'],
            take: itemsPerPage,
            skip: skip,
        });

        // Calcular o número da última página
        const lastPage = Math.ceil(totalCount / itemsPerPage);

        return {
            folowups,
            pagination: {
                totalItems: totalCount,
                currentPage: page,
                itemsPerPage: itemsPerPage,
                lastPage: lastPage,
            },
        };
    }


    //#  Teste para serviços com filtros
    async getServicosFiltro(
        qCodCoor: number = 110,
        qConcluido: boolean = false,
        qCodContra: number = 21972,
        qCodEnd: number = 22769,
    ): Promise<any> {
        const folowup = await this.prisma.folowup.findMany({
            where: {
                codcoor: qCodCoor,
                cad_contra: {
                    concluido: qConcluido,
                    codcontra: qCodContra,
                    codend: qCodEnd,
                },
            },
            select: {
                tetramitacao: true,
                teassessoria: true,
                cad_contra: {
                    select: {
                        cod: true,
                        codcontra: true,
                        codend: true,
                        cod_serv: true,
                        m_status: true,
                        dt_limite: true,
                        ddescserv: true,
                    },
                },
            },
            distinct: ['codccontra'],
            orderBy: {
                cad_contra: {
                    cod: 'asc',
                },
            },
        });

        const result = folowup.map(f => ({
            servico: f.cad_contra.cod,
            codcontra: f.cad_contra.codcontra,
            codend: f.cad_contra.codend,
            descserv: `${f.cad_contra.cod} - ${f.cad_contra.ddescserv.trim()}`,
            cod_serv: f.cad_contra.cod_serv,
            m_status: f.cad_contra.m_status,
            dt_limite: f.cad_contra.dt_limite,
            dt_limiteS: f.cad_contra.dt_limite ? f.cad_contra.dt_limite.toISOString().split('T')[0] : null,
        }));

        return result;
    }

    // # Serviços com filtros old
    async getServicosGerenteUnidadeFiltros(
        qcodCoor: number,// = 110,
        qcontrato: number,// = 21792,
        qUnidade: number,// = 22769,
        qConcluido: boolean,// = false,
        qCodServ: number,// = -1,
        qStatus: string,// = 'ALL',
        qDtlimite: Date,// = new Date('2001-01-01')
    ): Promise<any> {

        const folowups = await this.prisma.folowup.findMany({
            where: {
                codcoor: qcodCoor,
                contrato: qcontrato,
                codend: qUnidade,
                cad_contra: {
                    concluido: qConcluido,
                    cod_serv: qCodServ === -1 ? undefined : qCodServ,
                    m_status: qStatus === 'ALL' ? undefined : qStatus,
                    dt_limite: {
                        gte: qDtlimite === null ? new Date('2001-01-01') : qDtlimite,
                    },
                },
            },

            select: {
                codccontra: true,
                codend: true,
                descserv: true,
                tetramitacao: true,
                teassessoria: true,
                cadimov: true,
                //cad_contra: true,
                cad_contra: {
                    select: {
                        cod_serv: true,
                        codcontra: true,
                        m_status: true,
                        dt_limite: true,
                        ddescserv: true,
                        concluido: true,
                        rescisao: true,
                        suspenso: true,
                        valserv: true,
                        valameni: true,
                        pendencias: true,
                        obs_serv: true,
                        novo: true,
                        produto: true,
                        filtro_os: true,
                        obsresci: true,
                        sinal: true,
                        servnf: true,
                        teventserv: true,
                        revisao: true,
                        e_controle: true,
                        cnpj_conform: true,
                        medicao: true,
                        codstatusocorr: true,
                        horasassessoria: true,
                        horastramitacao: true,
                    },
                },
            },

            distinct: ['codccontra'],
            orderBy: [
                {
                    codccontra: 'asc',
                },
                {
                    cad_contra: {
                        concluido: 'asc',
                    },
                },
                {
                    cad_contra: {
                        cod_serv: 'asc',
                    },
                },
            ],
        });

        const results = folowups.map(f => ({
            codccontra: f.codccontra,
            contrato: f.cad_contra?.codcontra,
            codend: f.codend,
            tipo: f.cadimov?.tipo,
            descserv: `${f.codccontra} - ${f.descserv?.trim()}`,
            cod_serv: f.cad_contra?.cod_serv,
            rescisao: f.cad_contra?.rescisao,
            suspenso: f.cad_contra?.suspenso,
            dt_limite: f.cad_contra?.dt_limite,
            dt_limiteS: f.cad_contra?.dt_limite ? f.cad_contra?.dt_limite.toISOString().split('T')[0] : null,
            m_status: f.cad_contra.m_status,
            valserv: f.cad_contra.valserv,
            valameni: f.cad_contra.valameni,
            obs_serv: f.cad_contra.obs_serv,
            novo: f.cad_contra.novo ?? false,
            produto: f.cad_contra.produto,
            filtro_os: f.cad_contra.filtro_os ?? false,
            obsresci: f.cad_contra.obsresci,
            sinal: f.cad_contra.sinal ?? false,
            servnf: f.cad_contra.servnf ?? false,
            concluido: f.cad_contra.concluido ?? false,
            teventserv: f.cad_contra.teventserv ?? false,
            Xdt_limite: f.cad_contra.dt_limite,
            revisao: f.cad_contra.revisao ?? false,
            e_controle: f.cad_contra.e_controle,
            pendente: f.cad_contra.pendencias?.[0]?.pendente ?? false,
            qtd_pende: f.cad_contra.pendencias?.length ?? 0,
            cnpj_conform: f.cad_contra.cnpj_conform,
            medicao: f.cad_contra.medicao ?? false,
            codstatusocorr: f.cad_contra.codstatusocorr,
            tetramitacao: f.tetramitacao,
            teassessoria: f.teassessoria,
            horasassessoria: f.cad_contra.horasassessoria,
            horastramitacao: f.cad_contra.horastramitacao,
        }));

        // results.sort((a, b) => {
        //     if (a.concluido !== b.concluido) {
        //         return a.concluido ? 1 : -1;
        //     }
        //     if (a.cod_serv !== b.cod_serv) {
        //         return a.cod_serv - b.cod_serv;
        //     }
        //     return a.codccontra - b.codccontra;
        // });

        return results;
    }

    async getTarefas(qcodserv: number = 293912) {
        // Execute a query similar to the SQL function
        const tarefas = await this.prisma.folowup.findMany({
            where: {
                codccontra: qcodserv,
            },
            select: {
                cod: true,
                dttarefa: true,
                atribui: true,
                atribuid: true,
                desctarefa: true,
                conclusao: true,
                faturado: true,
                finanNFeRps: true,
                faturaok: true,
                fatura: true,
                evento: true,
                medicao: true,
                faturafixa: true,
                val_faturafixa: true,
                porcen: true,
                descadnf: true,
                fatura_ger_aux: true,
                te: true,
                ta: true,
                tedes: true,
                desenhista: true,
                coordena: true,
                coordena2: true,
                conclusaod: true,
                codana: true,
                catg_valmed: true,
                faturafixa_ok: true,
                faturafixa_ok_aux: true,
                analista: true,
                tetramitacao: true,
                teassessoria: true,
                cad_rps: true, // Add the missing property
                env_finan: true, // Add the missing property
            },
            orderBy: {
                dttarefa: 'asc',
            },
        });

        // Process the results to match the SQL function's output
        const processedTarefas = tarefas.map(tarefa => ({
            ...tarefa,
            sdttarefa: tarefa.dttarefa ? tarefa.dttarefa.toISOString().split('T')[0] : null,
            faturado: tarefa.faturado || tarefa.finanNFeRps,
            porcen: tarefa.cad_rps?.nfcancelada ? 0 : tarefa.porcen, // Use the related field
            nfcancelada: tarefa.cad_rps?.nfcancelada || false, // Calculate nfcancelada
            env_finan: tarefa.env_finan || false,
        }));

        return processedTarefas;
    }

}
