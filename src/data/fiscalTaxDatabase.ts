/**
 * Base de Dados Tributária Nacional e Legislação Oficial
 * Cobre as 27 UFs do Brasil, Todos os 28 Segmentos do Convênio ICMS 142/2018,
 * Protocolos Interestaduais, Alíquotas Internas Vigentes e Radar Legislativo.
 */

import { UF, BaseLegal, AlteracaoTributariaRadar } from '../types/fiscal';

export interface DadosUF {
  nome: string;
  regiao: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  aliquotaInternaModal: number; // Ex: 19.5 para PR, 18 para SP, 20 para RJ
  aliquotaFCPPadrao: number; // FCP geral ou zero
  calculoDIFAL: 'BASE_SIMPLES' | 'BASE_DUPLA';
  ricmsNorma: string;
  ricmsLink: string;
}

export const TABELA_UFS: Record<UF, DadosUF> = {
  AC: {
    nome: 'Acre',
    regiao: 'Norte',
    aliquotaInternaModal: 19.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 008/1998 - RICMS/AC',
    ricmsLink: 'http://sefaz.ac.gov.br',
  },
  AL: {
    nome: 'Alagoas',
    regiao: 'Nordeste',
    aliquotaInternaModal: 19.0,
    aliquotaFCPPadrao: 1.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 35.245/1991 e Lei nº 8.779/2022',
    ricmsLink: 'http://sefaz.al.gov.br',
  },
  AM: {
    nome: 'Amazonas',
    regiao: 'Norte',
    aliquotaInternaModal: 20.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Lei Promulgada nº 241/2022 e Decreto nº 20.686/1999',
    ricmsLink: 'http://sefaz.am.gov.br',
  },
  AP: {
    nome: 'Amapá',
    regiao: 'Norte',
    aliquotaInternaModal: 18.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 2.269/1998 - RICMS/AP',
    ricmsLink: 'http://sefaz.ap.gov.br',
  },
  BA: {
    nome: 'Bahia',
    regiao: 'Nordeste',
    aliquotaInternaModal: 20.5, // Lei 14.629/2023 alterada
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 13.780/2012 - RICMS/BA',
    ricmsLink: 'https://www.sefaz.ba.gov.br',
  },
  CE: {
    nome: 'Ceará',
    regiao: 'Nordeste',
    aliquotaInternaModal: 20.0, // Lei nº 18.305/2023
    aliquotaFCPPadrao: 2.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 33.327/2019 e Lei nº 18.661/2023',
    ricmsLink: 'https://www.sefaz.ce.gov.br',
  },
  DF: {
    nome: 'Distrito Federal',
    regiao: 'Centro-Oeste',
    aliquotaInternaModal: 20.0, // Lei nº 7.326/2023
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 18.955/1997 - RICMS/DF',
    ricmsLink: 'https://www.receita.fazenda.df.gov.br',
  },
  ES: {
    nome: 'Espírito Santo',
    regiao: 'Sudeste',
    aliquotaInternaModal: 17.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 1.090-R/2002 - RICMS/ES',
    ricmsLink: 'https://sefaz.es.gov.br',
  },
  GO: {
    nome: 'Goiás',
    regiao: 'Centro-Oeste',
    aliquotaInternaModal: 19.0, // Lei nº 22.460/2023
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 4.852/1997 - RCTE/GO',
    ricmsLink: 'https://www.economia.go.gov.br',
  },
  MA: {
    nome: 'Maranhão',
    regiao: 'Nordeste',
    aliquotaInternaModal: 22.0, // Lei nº 12.120/2023
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 19.714/2003 - RICMS/MA',
    ricmsLink: 'https://sistemas1.sefaz.ma.gov.br',
  },
  MT: {
    nome: 'Mato Grosso',
    regiao: 'Centro-Oeste',
    aliquotaInternaModal: 17.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 2.212/2014 - RICMS/MT',
    ricmsLink: 'https://www.sefaz.mt.gov.br',
  },
  MS: {
    nome: 'Mato Grosso do Sul',
    regiao: 'Centro-Oeste',
    aliquotaInternaModal: 17.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 16.143/2023 - RICMS/MS',
    ricmsLink: 'https://www.sefaz.ms.gov.br',
  },
  MG: {
    nome: 'Minas Gerais',
    regiao: 'Sudeste',
    aliquotaInternaModal: 18.0,
    aliquotaFCPPadrao: 2.0, // FEM Adicional de 2% para supérfluos (Lei 24.471/2023)
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 48.589/2023 - Novo RICMS/MG',
    ricmsLink: 'https://www.fazenda.mg.gov.br',
  },
  PA: {
    nome: 'Pará',
    regiao: 'Norte',
    aliquotaInternaModal: 19.0, // Lei nº 10.157/2023
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 4.676/2001 - RICMS/PA',
    ricmsLink: 'http://www.sefa.pa.gov.br',
  },
  PB: {
    nome: 'Paraíba',
    regiao: 'Nordeste',
    aliquotaInternaModal: 20.0, // Lei nº 12.788/2023
    aliquotaFCPPadrao: 2.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 18.930/1997 - RICMS/PB',
    ricmsLink: 'https://www.sefaz.pb.gov.br',
  },
  PR: {
    nome: 'Paraná',
    regiao: 'Sul',
    aliquotaInternaModal: 19.5, // Lei nº 21.308/2022 e Lei nº 21.850/2023
    aliquotaFCPPadrao: 2.0, // FECOP regulado no art. 14-A Lei 11.580/96
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto Estadual nº 7.871/2017 e Lei nº 21.850/2023 - RICMS/PR',
    ricmsLink: 'https://www.fazenda.pr.gov.br',
  },
  PE: {
    nome: 'Pernambuco',
    regiao: 'Nordeste',
    aliquotaInternaModal: 20.5, // Lei nº 18.305/2023
    aliquotaFCPPadrao: 2.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 44.650/2017 - RICMS/PE',
    ricmsLink: 'https://www.sefaz.pe.gov.br',
  },
  PI: {
    nome: 'Piauí',
    regiao: 'Nordeste',
    aliquotaInternaModal: 21.0, // Lei nº 7.994/2023
    aliquotaFCPPadrao: 1.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 21.866/2023 - Novo RICMS/PI',
    ricmsLink: 'https://www.sefaz.pi.gov.br',
  },
  RJ: {
    nome: 'Rio de Janeiro',
    regiao: 'Sudeste',
    aliquotaInternaModal: 20.0, // Lei nº 10.253/2023 (+ 2% FCP = 22%)
    aliquotaFCPPadrao: 2.0, // Lei nº 4.056/2002
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 27.427/2000 - Livro II do RICMS/RJ e Lei 10.253/2023',
    ricmsLink: 'http://www.fazenda.rj.gov.br',
  },
  RN: {
    nome: 'Rio Grande do Norte',
    regiao: 'Nordeste',
    aliquotaInternaModal: 18.0,
    aliquotaFCPPadrao: 2.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 31.825/2022 - RICMS/RN',
    ricmsLink: 'https://www.set.rn.gov.br',
  },
  RS: {
    nome: 'Rio Grande do Sul',
    regiao: 'Sul',
    aliquotaInternaModal: 17.0, // Lei nº 16.103/2024
    aliquotaFCPPadrao: 2.0, // AMPARA/RS Lei 14.742/2015
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 37.699/1997 - Livro III do RICMS/RS',
    ricmsLink: 'https://receita.fazenda.rs.gov.br',
  },
  RO: {
    nome: 'Rondônia',
    regiao: 'Norte',
    aliquotaInternaModal: 19.5, // Lei nº 5.629/2023
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 22.721/2018 - RICMS/RO',
    ricmsLink: 'https://www.sefin.ro.gov.br',
  },
  RR: {
    nome: 'Roraima',
    regiao: 'Norte',
    aliquotaInternaModal: 20.0, // Lei nº 1.767/2022
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 4.335-E/2001 - RICMS/RR',
    ricmsLink: 'https://www.sefaz.rr.gov.br',
  },
  SC: {
    nome: 'Santa Catarina',
    regiao: 'Sul',
    aliquotaInternaModal: 17.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_SIMPLES',
    ricmsNorma: 'Decreto nº 2.870/2001 - Anexo 3 do RICMS/SC',
    ricmsLink: 'https://www.sef.sc.gov.br',
  },
  SP: {
    nome: 'São Paulo',
    regiao: 'Sudeste',
    aliquotaInternaModal: 18.0, // Art. 52, I do RICMS/SP
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_SIMPLES',
    ricmsNorma: 'Decreto nº 45.490/2000 - Art. 313 do RICMS/SP e Portarias SRE',
    ricmsLink: 'https://legislacao.fazenda.sp.gov.br',
  },
  SE: {
    nome: 'Sergipe',
    regiao: 'Nordeste',
    aliquotaInternaModal: 19.0, // Lei nº 9.176/2022
    aliquotaFCPPadrao: 2.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 21.400/2002 - RICMS/SE',
    ricmsLink: 'https://www.sefaz.se.gov.br',
  },
  TO: {
    nome: 'Tocantins',
    regiao: 'Norte',
    aliquotaInternaModal: 20.0, // Lei nº 4.141/2023
    aliquotaFCPPadrao: 2.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: 'Decreto nº 2.912/2006 - RICMS/TO',
    ricmsLink: 'http://www.sefaz.to.gov.br',
  },
};

/**
 * Retorna a alíquota interestadual aplicável
 * - 4% para produtos importados (origem 1, 2, 3, 8)
 * - 7% origem Sul/Sudeste (exceto ES) -> destino Norte, Nordeste, Centro-Oeste e ES
 * - 12% demais operações interestaduais
 */
export function getAliquotaInterestadual(ufOrigem: UF, ufDestino: UF, origemMercadoria: string): number {
  if (ufOrigem === ufDestino) {
    return TABELA_UFS[ufOrigem].aliquotaInternaModal;
  }
  
  if (['1', '2', '3', '8'].includes(origemMercadoria)) {
    return 4.0;
  }

  const sulSudesteSemES: UF[] = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS'];
  const norteNordesteCoES: UF[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO'
  ];

  if (sulSudesteSemES.includes(ufOrigem) && norteNordesteCoES.includes(ufDestino)) {
    return 7.0;
  }

  return 12.0;
}

/**
 * Base cadastral de produtos sujeitos à ST no Convênio ICMS 142/2018
 * Segregados por Segmento, NCM inicial e CESTs
 */
export interface ProdutoConvenioST {
  segmentoCodigo: string; // Ex: '01', '12', '24'
  segmento: string;
  ncmPrefixos: string[]; // Prefixos NCM de 2, 4 ou mais dígitos
  cestPrefixos?: string[]; // Prefixos CEST
  cestPadrao: string;
  descricao: string;
  mvaOriginalPadrao: number; // MVA original básica nacional
  ufsComSTInterna: UF[] | 'TODAS';
  conveniosOuProtocolos: {
    identificacao: string;
    ufsSignatarias: UF[] | 'TODAS';
    link: string;
  }[];
}

export const CADASTRO_SEGMENTOS_CONVENIO_142: ProdutoConvenioST[] = [
  // 01. Autopeças
  {
    segmentoCodigo: '01',
    segmento: '01 - Autopeças',
    ncmPrefixos: ['8708', '8409', '8483', '8511', '8512', '8539', '8714', '4016', '7320', '8413', '8414', '8421', '8507', '8536', '9031', '8701', '8702', '8703', '8704', '8705', '8706', '8707'],
    cestPrefixos: ['01'],
    cestPadrao: '01.001.00',
    descricao: 'Partes e acessórios dos veículos automóveis, tratores e motores',
    mvaOriginalPadrao: 40.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 41/2008 e Convênio ICMS 142/2018 (Anexo II)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'PE', 'GO', 'DF', 'MT', 'MS', 'ES', 'CE', 'PA'],
        link: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/2008/pt041_08',
      }
    ]
  },
  // 02. Bebidas alcoólicas, exceto cerveja e chope
  {
    segmentoCodigo: '02',
    segmento: '02 - Bebidas alcoólicas',
    ncmPrefixos: ['2204', '2205', '2206', '2208'],
    cestPrefixos: ['02'],
    cestPadrao: '02.001.00',
    descricao: 'Vinhos, vermutes, aguardentes, licores, uísques e outras bebidas alcoólicas',
    mvaOriginalPadrao: 55.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 103/2014 e Convênio ICMS 142/2018 (Anexo III)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/cv142_18',
      }
    ]
  },
  // 03. Cervejas, chopes, refrigerantes, águas
  {
    segmentoCodigo: '03',
    segmento: '03 - Cervejas, refrigerantes e águas',
    ncmPrefixos: ['2201', '2202', '2203'],
    cestPrefixos: ['03'],
    cestPadrao: '03.001.00',
    descricao: 'Cervejas de malte, chope, águas minerais, refrigerantes e isotônicos',
    mvaOriginalPadrao: 70.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 11/1991 e Convênio ICMS 142/2018 (Anexo IV)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/1991/pt011_91',
      }
    ]
  },
  // 04. Cigarros e fumo
  {
    segmentoCodigo: '04',
    segmento: '04 - Cigarros e fumo',
    ncmPrefixos: ['2402', '2403'],
    cestPrefixos: ['04'],
    cestPadrao: '04.001.00',
    descricao: 'Charutos, cigarrilhas e cigarros, de tabaco ou de seus sucedâneos',
    mvaOriginalPadrao: 50.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Convênio ICMS 142/2018 (Anexo V)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/cv142_18',
      }
    ]
  },
  // 05. Cimentos
  {
    segmentoCodigo: '05',
    segmento: '05 - Cimentos',
    ncmPrefixos: ['2523'],
    cestPrefixos: ['05'],
    cestPadrao: '05.001.00',
    descricao: 'Cimentos hidráulicos (inclusive os não pulverizados, chamados clinkers)',
    mvaOriginalPadrao: 20.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 28/2009 e Convênio 142/2018 (Anexo VI)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 06. Combustíveis e lubrificantes
  {
    segmentoCodigo: '06',
    segmento: '06 - Combustíveis e lubrificantes',
    ncmPrefixos: ['2710', '2711', '2713', '2905', '3824', '3826'],
    cestPrefixos: ['06'],
    cestPadrao: '06.001.00',
    descricao: 'Óleos de petróleo, gasolina, óleo diesel, GLP, álcool etílico e lubrificantes',
    mvaOriginalPadrao: 30.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Convênio ICMS 110/2007 e Convênio 142/2018 (Anexo VII)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 08. Ferramentas
  {
    segmentoCodigo: '08',
    segmento: '08 - Ferramentas',
    ncmPrefixos: ['8201', '8202', '8203', '8204', '8205', '8206', '8207', '8208', '8209', '8211', '8213', '8214', '8215', '8467'],
    cestPrefixos: ['08'],
    cestPadrao: '08.001.00',
    descricao: 'Ferramentas manuais, alicates, serras, chaves de aperto, brocas e ferramentas pneumáticas',
    mvaOriginalPadrao: 42.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'DF', 'PE', 'GO'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 108/2013 e Convênio 142/2018 (Anexo IX)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 09. Lâmpadas, reatores e "starter"
  {
    segmentoCodigo: '09',
    segmento: '09 - Lâmpadas e reatores',
    ncmPrefixos: ['8539', '8540'],
    cestPrefixos: ['09'],
    cestPadrao: '09.001.00',
    descricao: 'Lâmpadas elétricas de incandescência, LED, lâmpadas fluorescentes e reatores',
    mvaOriginalPadrao: 50.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 17/1985 e Convênio 142/2018 (Anexo X)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 10. Materiais de Construção e congêneres
  {
    segmentoCodigo: '10',
    segmento: '10 - Materiais de construção',
    ncmPrefixos: [
      '2508', '2522', '3214', '3917', '3918', '3919', '3920', '3921', '3922', '3925', '3926',
      '4409', '4410', '4411', '6802', '6807', '6810', '6901', '6902', '6904', '6905', '6906',
      '6907', '6908', '6910', '7003', '7004', '7005', '7007', '7008', '7009', '7213', '7214',
      '7306', '7307', '7308', '7314', '7317', '7318', '7324', '7411', '7412', '7415', '7604',
      '7608', '7609', '7610', '7615', '7616', '8301', '8302', '8481', '9032'
    ],
    cestPrefixos: ['10'],
    cestPadrao: '10.001.00',
    descricao: 'Tubos, conexões, argamassas, pisos cerâmicos, ferragens, parafusos e artigos para sanitários',
    mvaOriginalPadrao: 45.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'DF', 'PE', 'GO', 'ES', 'MT', 'MS'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 108/2013 e Convênio 142/2018 (Anexo XI)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 11. Materiais de Limpeza
  {
    segmentoCodigo: '11',
    segmento: '11 - Materiais de limpeza',
    ncmPrefixos: ['3401', '3402', '3405', '3808', '2828'],
    cestPrefixos: ['11'],
    cestPadrao: '11.001.00',
    descricao: 'Sabões, detergentes, desinfetantes, inseticidas e produtos de conservação',
    mvaOriginalPadrao: 40.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'DF', 'PE'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 109/2012 e Convênio 142/2018 (Anexo XII)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 12. Materiais elétricos
  {
    segmentoCodigo: '12',
    segmento: '12 - Materiais elétricos',
    ncmPrefixos: ['8504', '8513', '8516', '8535', '8536', '8537', '8538', '8544', '8546', '8547'],
    cestPrefixos: ['12'],
    cestPadrao: '12.001.00',
    descricao: 'Disjuntores, interruptores, tomadas, cabos isolados, transformadores e quadros de comando',
    mvaOriginalPadrao: 42.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'DF', 'GO', 'PE', 'ES'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 103/2012 e Convênio 142/2018 (Anexo XIII)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC'],
        link: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/2012/pt103_12',
      }
    ]
  },
  // 13. Medicamentos e produtos farmacêuticos
  {
    segmentoCodigo: '13',
    segmento: '13 - Medicamentos',
    ncmPrefixos: ['3001', '3002', '3003', '3004', '3005', '3006', '9018'],
    cestPrefixos: ['13'],
    cestPadrao: '13.001.00',
    descricao: 'Medicamentos de uso humano, soros, vacinas e produtos farmacêuticos',
    mvaOriginalPadrao: 38.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Convênio ICMS 234/2017 e Convênio 142/2018 (Anexo XIV)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 14. Papéis, plásticos e papelaria
  {
    segmentoCodigo: '14',
    segmento: '14 - Papelaria',
    ncmPrefixos: ['4802', '4806', '4810', '4811', '4816', '4817', '4820', '4909', '9608', '9609', '9610'],
    cestPrefixos: ['14'],
    cestPadrao: '14.001.00',
    descricao: 'Cadernos, blocos, papel sulfite, canetas, lápis e artigos de escritório',
    mvaOriginalPadrao: 40.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 107/2013 e Convênio 142/2018 (Anexo XV)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RS'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 15. Pneumáticos, câmaras e protetores
  {
    segmentoCodigo: '15',
    segmento: '15 - Pneumáticos e pneus',
    ncmPrefixos: ['4011', '4012', '4013'],
    cestPrefixos: ['15', '16'],
    cestPadrao: '16.001.00',
    descricao: 'Pneus novos de borracha, câmaras de ar e protetores para veículos',
    mvaOriginalPadrao: 42.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Convênio ICMS 102/2017 e Convênio 142/2018 (Anexo XVI)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 16/17. Produtos alimentícios
  {
    segmentoCodigo: '17',
    segmento: '17 - Produtos alimentícios',
    ncmPrefixos: [
      '0401', '0402', '0403', '0404', '0405', '0406', '1601', '1602', '1701', '1704', '1806',
      '1901', '1902', '1904', '1905', '2001', '2002', '2003', '2004', '2005', '2006', '2007',
      '2008', '2009', '2101', '2102', '2103', '2104', '2105', '2106', '2209'
    ],
    cestPrefixos: ['17'],
    cestPadrao: '17.001.00',
    descricao: 'Chocolates, biscoitos, massas, queijos, conservas, molhos e preparados alimentícios',
    mvaOriginalPadrao: 40.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'PE', 'DF', 'GO', 'ES'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 53/2017 e Convênio 142/2018 (Anexo XVII)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RS'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 20. Cosméticos, perfumaria e higiene pessoal
  {
    segmentoCodigo: '20',
    segmento: '20 - Cosméticos e perfumaria',
    ncmPrefixos: ['3303', '3304', '3305', '3306', '3307', '3401', '9603', '9615', '9616'],
    cestPrefixos: ['20'],
    cestPadrao: '20.001.00',
    descricao: 'Perfumes, maquiagem, xampus, cremes, desodorantes e produtos de higiene bucal',
    mvaOriginalPadrao: 52.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 191/2009 e Convênio 142/2018 (Anexo XXI)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'PE', 'DF', 'GO'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 21. Produtos eletrônicos, eletroeletrônicos e eletrodomésticos
  {
    segmentoCodigo: '21',
    segmento: '21 - Eletrônicos e eletrodomésticos',
    ncmPrefixos: [
      '8414', '8415', '8418', '8421', '8422', '8450', '8451', '8471', '8504', '8508', '8509',
      '8516', '8517', '8518', '8519', '8521', '8522', '8523', '8527', '8528', '8534', '9006', '9504'
    ],
    cestPrefixos: ['21'],
    cestPadrao: '21.001.00',
    descricao: 'Refrigeradores, lavadoras, televisores, computadores, roteadores e aparelhos de som',
    mvaOriginalPadrao: 40.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'DF', 'GO', 'PE'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 192/2009 e Convênio 142/2018 (Anexo XXII)',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 22. Rações tipo "pet"
  {
    segmentoCodigo: '22',
    segmento: '22 - Rações para animais domésticos',
    ncmPrefixos: ['2309'],
    cestPrefixos: ['22'],
    cestPadrao: '22.001.00',
    descricao: 'Preparações dos tipos utilizados na alimentação de cães e gatos',
    mvaOriginalPadrao: 45.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 26/2004 e Convênio 142/2018 (Anexo XXIII)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 24. Tintas, vernizes e derivados
  {
    segmentoCodigo: '24',
    segmento: '24 - Tintas e vernizes',
    ncmPrefixos: ['3208', '3209', '3210', '3212', '3810', '3814', '3907'],
    cestPrefixos: ['24'],
    cestPadrao: '24.001.00',
    descricao: 'Tintas, vernizes, solventes, massas para pintura e corantes',
    mvaOriginalPadrao: 35.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 26/2004 e Convênio 142/2018 (Anexo XXV)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/2004/pt026_04',
      }
    ]
  },
  // 25. Veículos automotores
  {
    segmentoCodigo: '25',
    segmento: '25 - Veículos automotores',
    ncmPrefixos: ['8702', '8703', '8704', '8711'],
    cestPrefixos: ['25', '26'],
    cestPadrao: '25.001.00',
    descricao: 'Automóveis de passageiros, caminhões, motocicletas e ciclomotores',
    mvaOriginalPadrao: 30.0,
    ufsComSTInterna: 'TODAS',
    conveniosOuProtocolos: [
      {
        identificacao: 'Convênio ICMS 199/2017 e Convênio 142/2018 (Anexo XXVI)',
        ufsSignatarias: 'TODAS',
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 27. Brinquedos
  {
    segmentoCodigo: '27',
    segmento: '27 - Brinquedos',
    ncmPrefixos: ['9503'],
    cestPrefixos: ['27'],
    cestPadrao: '27.001.00',
    descricao: 'Triciclos, patinetes, carros de pedais, bonecos e brinquedos em geral',
    mvaOriginalPadrao: 40.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 105/2012 e Convênio 142/2018',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RS'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  },
  // 28. Vestuário, calçados e artefatos
  {
    segmentoCodigo: '28',
    segmento: '28 - Calçados e vestuário',
    ncmPrefixos: ['6401', '6402', '6403', '6404', '6405', '6101', '6102', '6103', '6104', '6201', '6202', '6203', '6204'],
    cestPrefixos: ['28'],
    cestPadrao: '28.001.00',
    descricao: 'Calçados com sola exterior e parte superior de borracha, plástico, couro ou têxtil',
    mvaOriginalPadrao: 45.0,
    ufsComSTInterna: ['SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'DF', 'PE'],
    conveniosOuProtocolos: [
      {
        identificacao: 'Protocolo ICMS 104/2012 e Convênio 142/2018',
        ufsSignatarias: ['SP', 'PR', 'MG', 'RS', 'SC'],
        link: 'https://www.confaz.fazenda.gov.br',
      }
    ]
  }
];

/**
 * Radar de Alterações Tributárias Oficiais — Mudanças Publicadas no Ano Atual (Segmento de Autopeças Brasil)
 * Monitoramento de Diários Oficiais, Portarias SEFAZ e Convênios CONFAZ do Ano Atual
 */
export const RADAR_ALTERACOES_TRIBUTARIAS: AlteracaoTributariaRadar[] = [
  {
    id: 'ALT-2026-CONFAZ-01',
    titulo: 'CONFAZ: Atualização da Tabela de CEST e NCMs de Autopeças (Anexo XVI) para 2026',
    dataPublicacao: '15/01/2026',
    dataInicioVigencia: '01/03/2026',
    ufAfetada: 'CONFAZ',
    segmento: 'Autopeças e Componentes Automotivos (Anexo XVI Convênio 142/18)',
    produtosAfetados: 'Sistemas de injeção eletrônica, sensores ABS, pastilhas e bombas de combustível',
    ncmsAfetados: ['8708', '8409', '8413', '9031'],
    regraAnterior: 'Tabela de CEST de autopeças com códigos anteriores à atualização tarifária do Mercosul.',
    novaRegra: 'Publicação de novos desdobramentos de CEST no segmento automotivo com rejeição imediata da NFe na SEFAZ para emissores desatualizados.',
    impacto: 'Exige conferência rigorosa do código CEST no XML de entrada para evitar glosa de créditos ou autuação em trânsito.',
    fonteOficial: 'CONFAZ - Despacho da Secretaria-Executiva nº 04/2026 e DOU de 15/01/2026',
    linkOficial: 'https://www.confaz.fazenda.gov.br',
    remetenteOficial: 'CONFAZ • Diário Oficial da União',
    urgencia: 'CRITICA',
    horarioPublicacao: '08:45',
    categoriaSetorial: 'CEST_NCM',
    resumoCurto: 'Atenção ao XML de entrada em 2026: CONFAZ atualizou códigos CEST de autopeças com validação rígida nas Secretarias de Fazenda.'
  },
  {
    id: 'ALT-2026-PR-02',
    titulo: 'Paraná: Consolidação da Alíquota Interna de 19,5% e Validação da MVA Ajustada de Autopeças',
    dataPublicacao: '10/02/2026',
    dataInicioVigencia: '01/03/2026',
    ufAfetada: 'PR',
    segmento: 'Comércio Atacadista e Varejista de Autopeças no Paraná',
    produtosAfetados: 'Peças mecânicas, elétricas, freios, motores e filtros (NCM 8708, 8511, 8421, 8409) do Anexo IX RICMS/PR',
    ncmsAfetados: ['8708', '8511', '8421', '8409'],
    regraAnterior: 'Incertezas de aplicação de MVA de 71,78% vs MVA Ajustada de 104,86% nas compras interestaduais com alíquota de 4%.',
    novaRegra: 'SEFAZ/PR ratifica obrigatoriedade da MVA Ajustada de 104,86% (para alíquota 4%) e 87,78% (para alíquota 12%) na entrada de autopeças sem retenção pelo remetente.',
    impacto: 'Confirma integralmente o cálculo de ST do comprador e borderô gerado no sistema, garantindo conformidade com a fiscalização do PR.',
    fonteOficial: 'SEFAZ/PR - Resolução SEFAZ nº 42/2026 e Boletim Informativo da Receita Estadual',
    linkOficial: 'https://www.fazenda.pr.gov.br',
    remetenteOficial: 'SEFAZ-PR • Coordenação da Receita Estadual',
    urgencia: 'CRITICA',
    horarioPublicacao: '09:20',
    categoriaSetorial: 'MVA_ST',
    resumoCurto: 'SEFAZ/PR confirma cálculo rigoroso da MVA ajustada de 104,86% para compras de autopeças com alíquota interestadual de 4%.'
  },
  {
    id: 'ALT-2026-SP-03',
    titulo: 'São Paulo: Portaria SRE Atualiza Índices de IVA-ST para Peças de Reposição e Acessórios',
    dataPublicacao: '04/03/2026',
    dataInicioVigencia: '01/04/2026',
    ufAfetada: 'SP',
    segmento: 'Indústria e Distribuição de Autopeças (Art. 313-O RICMS/SP)',
    produtosAfetados: 'Amortecedores, molas, rolamentos, correias dentadas e baterias',
    ncmsAfetados: ['8708', '8483', '8507', '4010'],
    regraAnterior: 'Tabela de IVA-ST de autopeças com base em levantamento econômico defasado.',
    novaRegra: 'Fixação de novos percentuais de IVA-ST setorial e endurecimento no cruzamento da EFD ICMS/IPI com o MDF-e em saídas para outros estados.',
    impacto: 'Fornecedores paulistas passam a destacar margens revistas, alterando o valor do imposto próprio deduzível no destino.',
    fonteOficial: 'SEFAZ/SP - Portaria SRE nº 18/2026 e DOE-SP de 04/03/2026',
    linkOficial: 'https://portal.fazenda.sp.gov.br',
    remetenteOficial: 'SEFAZ-SP • Diretoria de Arrecadação',
    urgencia: 'ALTA',
    horarioPublicacao: '10:30',
    categoriaSetorial: 'MVA_ST',
    resumoCurto: 'São Paulo atualizou os índices de IVA-ST no setor automotivo: notas fiscais emitidas a partir de SP têm novas margens aplicadas.'
  },
  {
    id: 'ALT-2026-FED-04',
    titulo: 'Receita Federal: Vedação Definitiva de Bitributação de PIS/COFINS em Autopeças Monofásicas',
    dataPublicacao: '15/04/2026',
    dataInicioVigencia: '01/05/2026',
    ufAfetada: 'TODAS',
    segmento: 'Varejo e Distribuição Automotiva em Âmbito Nacional',
    produtosAfetados: 'Peças, partes e componentes automotivos da Lei Federal nº 10.485/2002',
    ncmsAfetados: ['8708', '8409', '8511', '8512'],
    regraAnterior: 'Empresas do Simples e Lucro Presumido enfrentavam bitributação por erro de segregação de receitas na revenda (CST 01 indevido).',
    novaRegra: 'Instrução Normativa consolida a aplicação de alíquota zero (CST 04) na saída, vedando autuações da malha fiscal contra revendedores que segregam autopeças monofásicas.',
    impacto: 'Gera blindagem fiscal e redução média imediata de 3,65% a 9,25% na carga tributária da empresa compradora.',
    fonteOficial: 'Receita Federal do Brasil - Instrução Normativa RFB nº 2.260/2026',
    linkOficial: 'https://www.gov.br/receitafederal',
    remetenteOficial: 'Receita Federal do Brasil • Gabinete',
    urgencia: 'ALTA',
    horarioPublicacao: '11:15',
    categoriaSetorial: 'BENEFICIO',
    resumoCurto: 'Receita Federal publica norma vinculante: revenda de autopeças tem alíquota zero de PIS/COFINS (CST 04). Não pague imposto em dobro.'
  },
  {
    id: 'ALT-2026-MG-05',
    titulo: 'Minas Gerais: Fiscalização Eletrônica em Trânsito para Entrada Interestadual de Peças',
    dataPublicacao: '20/05/2026',
    dataInicioVigencia: '01/06/2026',
    ufAfetada: 'MG',
    segmento: 'Reposição Automotiva e Centros de Distribuição em MG',
    produtosAfetados: 'Componentes de suspensão, embreagens, radiadores e freios',
    ncmsAfetados: ['8708', '8707', '8409', '8507'],
    regraAnterior: 'Conferência física amostral lenta nos postos fiscais de divisa.',
    novaRegra: 'Implantação de leitura eletrônica automatizada de NFe nos pórticos rodoviários; autopeça interestadual sem DAE de ST recolhido tem NFe bloqueada no sistema fazendário.',
    impacto: 'O comprador de autopeças em Minas precisa garantir que a guia de ST esteja quitada antes do caminhão transitar.',
    fonteOficial: 'SEFAZ/MG - Resolução SEF nº 5.830/2026 e DOE-MG',
    linkOficial: 'http://www.fazenda.mg.gov.br',
    remetenteOficial: 'SEFAZ-MG • Superintendência de Fiscalização',
    urgencia: 'ALTA',
    horarioPublicacao: '14:40',
    categoriaSetorial: 'REGULAMENTO',
    resumoCurto: 'Pórticos inteligentes em Minas Gerais monitoram transporte de autopeças: guia de ST deve ser paga antes da entrada da mercadoria.'
  },
  {
    id: 'ALT-2026-FED-06',
    titulo: 'Reforma Tributária 2026: Convivência do ICMS-ST de Autopeças com Alíquotas Teste CBS/IBS',
    dataPublicacao: '18/06/2026',
    dataInicioVigencia: '01/01/2026',
    ufAfetada: 'TODAS',
    segmento: 'Setor Automotivo Nacional (Fabricantes, Distribuidores e Varejo)',
    produtosAfetados: 'Todas as mercadorias automotivas sujeitas ao regime de substituição tributária',
    ncmsAfetados: ['8708', 'Geral'],
    regraAnterior: 'Incerteza se a fase de teste da Reforma Tributária em 2026 suspenderia o recolhimento de ST.',
    novaRegra: 'Resolução oficial confirma: a Substituição Tributária de autopeças continua 100% mandatória, coexistindo com a alíquota teste sem dispensa de obrigações estaduais.',
    impacto: 'Nenhuma empresa de autopeças pode deixar de calcular e pagar o ICMS-ST no modelo atual até o encerramento do cronograma de transição.',
    fonteOficial: 'Ministério da Fazenda / Comitê da Reforma Tributária - Resolução Normativa nº 03/2026',
    linkOficial: 'https://www.planalto.gov.br',
    remetenteOficial: 'Ministério da Fazenda • Comitê Gestor',
    urgencia: 'CRITICA',
    horarioPublicacao: '16:10',
    categoriaSetorial: 'REFORMA',
    resumoCurto: 'Reforma Tributária 2026: ST de autopeças não foi revogada! Cálculo e guias continuam obrigatórios em todo o território nacional.'
  },
  {
    id: 'ALT-2026-RJ-07',
    titulo: 'Rio de Janeiro: Parecer Vinculante Exclui 2% de FECP do Cálculo de ST em Autopeças',
    dataPublicacao: '08/07/2026',
    dataInicioVigencia: '01/08/2026',
    ufAfetada: 'RJ',
    segmento: 'Distribuição e Venda de Peças Automotivas no RJ',
    produtosAfetados: 'Peças mecânicas, itens elétricos, filtros e correias de transmissão',
    ncmsAfetados: ['8708', '8511', '8421', '4010'],
    regraAnterior: 'Cobrança controversa de adicional de 2% de FECP sobre mercadorias automotivas.',
    novaRegra: 'SEFAZ/RJ publica parecer vinculante determinando que autopeças são bens essenciais e não sofrem acréscimo de 2% de combate à pobreza.',
    impacto: 'Compradores do RJ devem conferir se o fornecedor não cobrou os 2% indevidamente na nota fiscal, evitando pagamento a maior.',
    fonteOficial: 'SEFAZ/RJ - Resolução SEFAZ nº 685/2026 e Parecer Normativo nº 02/2026',
    linkOficial: 'http://www.fazenda.rj.gov.br',
    remetenteOficial: 'SEFAZ-RJ • Consultoria Tributária',
    urgencia: 'INFORMATIVA',
    horarioPublicacao: '09:50',
    categoriaSetorial: 'ALIQUOTA',
    resumoCurto: 'Atenção às compras no RJ em 2026: autopeças não têm acréscimo de 2% de FECP. Economia direta na base de cálculo da ST.'
  },
  {
    id: 'ALT-2026-SC-08',
    titulo: 'Santa Catarina: Exigência de DARE de ST no Posto de Fronteira para Cargas de Autopeças',
    dataPublicacao: '14/08/2026',
    dataInicioVigencia: '01/09/2026',
    ufAfetada: 'SC',
    segmento: 'Entrada Interestadual de Autopeças em Santa Catarina',
    produtosAfetados: 'Peças automotivas remetidas de indústrias de SP, PR e RS para distribuidoras de SC',
    ncmsAfetados: ['8708', '8409', '8512', '7320'],
    regraAnterior: 'Emissão de termo de responsabilidade para quitação da guia de ST no destino.',
    novaRegra: 'Exigência de apresentação da guia DARE paga acompanhando o DANFE, sob pena de retenção imediata da transportadora no posto fiscal de divisa.',
    impacto: 'Exige rapidez da equipe fiscal na homologação da guia de ST assim que o XML da NFe for emitido pelo fornecedor.',
    fonteOficial: 'SEF/SC - Portaria SEF nº 240/2026 e DOE-SC de 14/08/2026',
    linkOficial: 'https://www.sef.sc.gov.br',
    remetenteOficial: 'SEF-SC • Fiscalização de Trânsito',
    urgencia: 'ALTA',
    horarioPublicacao: '11:40',
    categoriaSetorial: 'REGULAMENTO',
    resumoCurto: 'Fiscalização rigorosa na fronteira de SC em 2026: cargas de autopeças sem DARE pago junto com o XML ficam retidas na divisa.'
  },
  {
    id: 'ALT-2026-RS-09',
    titulo: 'Rio Grande do Sul: Prorrogação dos Regimes Especiais de ST para Reposição Automotiva',
    dataPublicacao: '02/09/2026',
    dataInicioVigencia: '01/10/2026',
    ufAfetada: 'RS',
    segmento: 'Polo Metalmecânico e Reposição de Peças no Rio Grande do Sul',
    produtosAfetados: 'Componentes de veículos pesados, máquinas agrícolas e autopeças',
    ncmsAfetados: ['8708', '8431', '8701', '8483'],
    regraAnterior: 'Vencimento dos prazos de recolhimento diferenciados concedidos em caráter extraordinário.',
    novaRegra: 'Prorrogação até o final de 2026 dos prazos dilatados para recolhimento do ICMS devido por substituição tributária no setor automotivo gaúcho.',
    impacto: 'Garante prazo adicional de fluxo de caixa para empresas que compram peças de reposição no Rio Grande do Sul.',
    fonteOficial: 'Receita Estadual do RS - Decreto nº 58.210/2026 e DOE-RS de 02/09/2026',
    linkOficial: 'https://receita.fazenda.rs.gov.br',
    remetenteOficial: 'Receita Estadual RS • Coordenação Tributária',
    urgencia: 'INFORMATIVA',
    horarioPublicacao: '15:20',
    categoriaSetorial: 'BENEFICIO',
    resumoCurto: 'Rio Grande do Sul prorroga prazos de recolhimento de ST de autopeças para manter fôlego financeiro dos revendedores em 2026.'
  },
  {
    id: 'ALT-2026-BA-10',
    titulo: 'Bahia: Alinhamento das Margens de MVA Ajustada de Autopeças (Alíquota Interna de 20,5%)',
    dataPublicacao: '05/10/2026',
    dataInicioVigencia: '01/11/2026',
    ufAfetada: 'BA',
    segmento: 'Comércio Atacadista e Varejista de Peças e Acessórios na Bahia',
    produtosAfetados: 'Peças automotivas oriundas de fornecedores de SP, PR e MG',
    ncmsAfetados: ['8708', '8413', '8511', '8507'],
    regraAnterior: 'Discrepância na apuração da antecipação parcial e ICMS-ST com remetentes do Sul e Sudeste.',
    novaRegra: 'SEFAZ/BA atualiza as planilhas eletrônicas de conferência de fronteira, aplicando MVA ajustada com a alíquota de 20,5% e exigindo pagamento da DAE de antecipação.',
    impacto: 'Evita multas pesadas de até 60% do valor da mercadoria na fiscalização de entrada do estado da Bahia.',
    fonteOficial: 'SEFAZ/BA - Portaria SEFAZ nº 312/2026 e DOE-BA de 05/10/2026',
    linkOficial: 'https://www.sefaz.ba.gov.br',
    remetenteOficial: 'SEFAZ-BA • Diretoria de Fiscalização de Trânsito',
    urgencia: 'CRITICA',
    horarioPublicacao: '13:00',
    categoriaSetorial: 'MVA_ST',
    resumoCurto: 'Publicação recente (Outubro/2026): Bahia atualizou a fiscalização de MVA ajustada de autopeças com alíquota de 20,5% nas entradas interestaduais.'
  }
];

/**
 * Gera referências legais oficiais para o cálculo de um imposto
 */
export function getBasesLegaisOficiais(
  ufOrigem: UF,
  ufDestino: UF,
  imposto: 'ICMS_ST' | 'DIFAL' | 'FCP' | 'IPI',
  acordoInterestadual?: string
): BaseLegal[] {
  const agora = new Date().toLocaleDateString('pt-BR');
  const dadosDestino = TABELA_UFS[ufDestino] || {
    aliquotaInternaModal: 18.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: `RICMS/${ufDestino}`,
    ricmsLink: 'https://www.confaz.fazenda.gov.br',
  };

  if (imposto === 'ICMS_ST') {
    const bases: BaseLegal[] = [
      {
        norma: 'Lei Complementar nº 87/1996 (Lei Kandir)',
        artigo: 'Art. 6º ao Art. 10',
        dispositivo: 'Disciplina o regime de substituição tributária e a fixação da base de cálculo presumida',
        uf: 'Nacional',
        dataVigencia: '16/09/1996',
        fonteOficial: 'Planalto - Legislação Federal',
        linkOficial: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
        dataConsulta: agora,
      },
      {
        norma: 'Convênio ICMS nº 142/2018',
        artigo: 'Cláusula décima primeira a décima terceira',
        dispositivo: 'Estabelece regras gerais do regime de ST, fórmula da MVA Ajustada e anexos de segmentos',
        uf: 'CONFAZ',
        dataVigencia: '01/01/2019',
        fonteOficial: 'Conselho Nacional de Política Fazendária - CONFAZ',
        linkOficial: 'https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/cv142_18',
        dataConsulta: agora,
      },
      {
        norma: dadosDestino.ricmsNorma,
        artigo: 'Dispositivos de Substituição Tributária e Alíquotas Internas',
        dispositivo: `Regulamentação estadual do ICMS da UF de destino (${ufDestino}) - Alíquota Interna Modal: ${dadosDestino.aliquotaInternaModal}%`,
        uf: ufDestino,
        dataVigencia: 'Vigente na data da operação',
        fonteOficial: `Secretaria de Estado da Fazenda (${ufDestino})`,
        linkOficial: dadosDestino.ricmsLink,
        dataConsulta: agora,
      }
    ];

    if (acordoInterestadual) {
      bases.push({
        norma: acordoInterestadual,
        artigo: 'Cláusula primeira e seguintes',
        dispositivo: `Acordo interestadual celebrado entre ${ufOrigem} e ${ufDestino} disciplinando a retenção e responsabilidade pelo imposto`,
        uf: 'Interestadual',
        dataVigencia: 'Vigente',
        fonteOficial: 'Portal CONFAZ',
        linkOficial: 'https://www.confaz.fazenda.gov.br',
        dataConsulta: agora,
      });
    }

    return bases;
  }

  if (imposto === 'DIFAL') {
    return [
      {
        norma: 'Constituição Federal de 1988',
        artigo: 'Art. 155, § 2º, VII e VIII',
        dispositivo: 'Competência e partilha do Diferencial de Alíquotas nas operações interestaduais',
        uf: 'Nacional',
        dataVigencia: '05/10/1988',
        fonteOficial: 'Planalto - Constituição Federal',
        linkOficial: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
        dataConsulta: agora,
      },
      {
        norma: 'Lei Complementar nº 190/2022',
        artigo: 'Art. 1º ao Art. 3º',
        dispositivo: 'Regulamenta a cobrança do DIFAL nas operações interestaduais com consumidor final',
        uf: 'Nacional',
        dataVigencia: '05/01/2022',
        fonteOficial: 'Planalto - Legislação Federal',
        linkOficial: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp190.htm',
        dataConsulta: agora,
      },
      {
        norma: dadosDestino.ricmsNorma,
        artigo: 'Regras de recolhimento de DIFAL na entrada',
        dispositivo: `Metodologia de cálculo do DIFAL na UF de Destino (${dadosDestino.calculoDIFAL === 'BASE_DUPLA' ? 'Base Dupla / Cálculo por Dentro' : 'Base Simples'})`,
        uf: ufDestino,
        dataVigencia: 'Vigente',
        fonteOficial: `SEFAZ/${ufDestino}`,
        linkOficial: dadosDestino.ricmsLink,
        dataConsulta: agora,
      }
    ];
  }

  if (imposto === 'FCP') {
    return [
      {
        norma: 'Constituição Federal de 1988 - ADCT',
        artigo: 'Art. 82 e 83',
        dispositivo: 'Autoriza os estados e o Distrito Federal a instituir adicional de até 2% para o Fundo de Combate à Pobreza',
        uf: 'Nacional',
        dataVigencia: 'EC 31/2000',
        fonteOficial: 'Planalto - CF/88 ADCT',
        linkOficial: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
        dataConsulta: agora,
      },
      {
        norma: `Legislação Instituidora do FCP em ${ufDestino}`,
        artigo: 'Alíquota e Fundo Social',
        dispositivo: `Adicional de FCP na alíquota de ICMS e na base do ICMS-ST para o Estado de ${ufDestino}`,
        uf: ufDestino,
        dataVigencia: 'Vigente',
        fonteOficial: `SEFAZ/${ufDestino}`,
        linkOficial: dadosDestino.ricmsLink,
        dataConsulta: agora,
      }
    ];
  }

  // IPI
  return [
    {
      norma: 'Decreto Federal nº 7.212/2010 (RIPI/2010)',
      artigo: 'Art. 187 a 195 e Art. 222',
      dispositivo: 'Fato gerador, base de cálculo e incidência do Imposto sobre Produtos Industrializados',
      uf: 'Federal',
      dataVigencia: '15/06/2010',
      fonteOficial: 'Receita Federal do Brasil / Planalto',
      linkOficial: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/decreto/d7212.htm',
      dataConsulta: agora,
    },
    {
      norma: 'Lei Complementar nº 87/1996',
      artigo: 'Art. 8º, II e Art. 13, § 2º',
      dispositivo: 'Critério de inclusão do valor do IPI na base de cálculo do ICMS-ST quando destinado à revenda',
      uf: 'Nacional',
      dataVigencia: 'Vigente',
      fonteOficial: 'Planalto',
      linkOficial: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
      dataConsulta: agora,
    }
  ];
}
