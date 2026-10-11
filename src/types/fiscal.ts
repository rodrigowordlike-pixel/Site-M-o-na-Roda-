/**
 * Auditor Fiscal Universal de NF-e — Definições de Tipos
 */

export type UF =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type StatusCalculo = 'CONFIRMADO' | 'NAO_CONFIRMADO';

export type ModalidadeMvaAutopecas = 'MVA_71_78' | 'MVA_40_00';

export type ClassificacaoST =
  | 'A' // A — Sem ST (não sujeito a ST na operação)
  | 'B' // B — ST já retida (NF demonstra que a ST já foi recolhida/retida pelo remetente)
  | 'C' // C — ST devida pelo destinatário (mercadoria sujeita a ST e responsabilidade é do destinatário)
  | 'D' // D — ST possivelmente devida, mas não confirmada (indicação de ST sem confirmação legal)
  | 'E'; // E — Não é possível determinar (informações insuficientes)

export interface EmitenteNFe {
  cnpj: string;
  cpf?: string;
  xNome: string;
  xFant?: string;
  ie?: string;
  uf: UF;
  cMun?: string;
  xMun?: string;
  crt: '1' | '2' | '3' | '4'; // 1 = Simples Nacional, 2 = Simples Nacional - excesso, 3 = Regime Normal, 4 = MEI
  crtDescricao: string;
}

export interface DestinatarioNFe {
  cnpj: string;
  cpf?: string;
  xNome: string;
  ie?: string;
  uf: UF;
  cMun?: string;
  xMun?: string;
  indIEDest: '1' | '2' | '9'; // 1 = Contribuinte ICMS, 2 = Isento, 9 = Não Contribuinte
  indIEDestDescricao: string;
}

export interface ItemNFe {
  nItem: number;
  cProd: string;
  xProd: string;
  ncm: string;
  cest?: string;
  cEAN?: string;
  cEANTrib?: string;
  cfop: string;
  uCom: string;
  qCom: number;
  vUnCom: number;
  vProd: number;
  vDesc: number;
  vFrete: number;
  vSeg: number;
  vOutro: number;
  
  // Dados fiscais do XML
  origem: string;
  cst?: string;
  csosn?: string;
  vBC: number;
  pICMS: number;
  vICMS: number;
  
  // ICMS-ST no XML
  vBCST: number;
  pMVAST?: number;
  pICMSST?: number;
  vICMSST: number;
  
  // FCP no XML
  vBCFCP: number;
  pFCP: number;
  vFCP: number;
  vBCFCPST: number;
  pFCPST: number;
  vFCPST: number;
  
  // IPI no XML
  cstIPI?: string;
  vBCIPI: number;
  pIPI: number;
  vIPI: number;
}

export interface NFeParsed {
  nNF: string;
  serie: string;
  dhEmi: string; // ISO string ou data formato NF-e
  dEmiFormatada: string;
  chNFe: string;
  natOp: string;
  finNFe: string; // 1 = Normal, 2 = Complementar, 3 = Ajuste, 4 = Devolução
  tpNF: string; // 0 = Entrada, 1 = Saída
  idDest: string; // 1 = Interna, 2 = Interestadual, 3 = Exterior
  indFinal: string; // 0 = Normal, 1 = Consumidor Final
  indPres: string; // Indicador de presença
  
  emitente: EmitenteNFe;
  destinatario: DestinatarioNFe;
  itens: ItemNFe[];
  
  totaisXML: {
    vProd: number;
    vFrete: number;
    vSeg: number;
    vDesc: number;
    vOutro: number;
    vBC: number;
    vICMS: number;
    vBCST: number;
    vST: number;
    vFCP: number;
    vFCPST: number;
    vIPI: number;
    vNF: number;
  };
}

export interface BaseLegal {
  norma: string;
  artigo: string;
  dispositivo: string;
  uf: string;
  dataVigencia: string;
  fonteOficial: string;
  linkOficial: string;
  dataConsulta: string;
}

export interface MemoriaCalculoItem {
  valorProdutos: number;
  desconto: number;
  frete: number;
  seguro: number;
  outrasDespesas: number;
  ipi: number;
  ipiIntegraBaseST: boolean;
  motivoTratamentoIPI: string;
  
  baseOperacaoPropria: number;
  aliquotaInter: number;
  icmsProprioDeduzivel: number;
  motivoIcmsProprio: string;
  
  mvaOriginal: number;
  mvaAjustada: number;
  mvaAplicada: number;
  houveAjusteMVA: boolean;
  motivoAjusteMVA: string;
  
  baseST: number;
  aliquotaInternaDestino: number;
  aliquotaFCP: number;
  
  debitoSTBruto: number;
  icmsSTDevido: number;
  fcpSTDevido: number;
  difalDevido: number;
  ipiDevidoDestinatario: number;
  
  totalItemRecolher: number;
  passoAPasso: string[];
}

export interface ItemAuditoria {
  item: ItemNFe;
  classificacao: ClassificacaoST;
  classificacaoDescricao: string;
  statusCalculo: StatusCalculo;
  motivoNaoConfirmado?: string;
  
  // Responsabilidade
  responsavelRecolhimento: 'DESTINATARIO' | 'REMETENTE' | 'NAO_APLICAVEL' | 'INCERTO';
  regimeSTDestino: boolean;
  temAcordoInterestadual: boolean;
  nomeAcordoInterestadual?: string;
  
  // Valores calculados para recolhimento pelo destinatário
  baseST: number;
  mva: number;
  icmsST: number;
  fcpST: number;
  difal: number;
  ipi: number;
  totalRecolher: number;
  
  memoriaCalculo: MemoriaCalculoItem;
  basesLegais: BaseLegal[];
}

export interface InconsistenciaXML {
  itemNumero?: number;
  codigo: string;
  tipo: 'ERRO' | 'ALERTA' | 'DIVERGENCIA';
  campo: string;
  descricao: string;
  impacto: string;
  sugestao: string;
}

export interface ConferenciaDuplaItem {
  itemNumero: number;
  descricao: string;
  calculo1: {
    baseST: number;
    icmsST: number;
    fcpST: number;
    difal: number;
    total: number;
  };
  calculo2: {
    baseST: number;
    icmsST: number;
    fcpST: number;
    difal: number;
    total: number;
  };
  divergencia: boolean;
  detalheDivergencia?: string;
}

export interface ResumoAuditoriaNFe {
  nNF: string;
  serie: string;
  chaveAcesso: string;
  dataEmissao: string;
  ufOrigem: UF;
  ufDestino: UF;
  finalidadeOperacao: string;
  consumidorFinal: boolean;
  
  // Valores Consolidados a Recolher pelo Destinatário
  icmsSTaRecolher: number;
  fcpSTaRecolher: number;
  difalARecolher: number;
  ipiARecolher: number;
  outrosTributos: number;
  totalARecolher: number;
  
  statusGeral: StatusCalculo;
  motivoGeralNaoConfirmado?: string;
  
  itensAuditados: ItemAuditoria[];
  inconsistencias: InconsistenciaXML[];
  conferenciaDupla: {
    itens: ConferenciaDuplaItem[];
    houveDivergencia: boolean;
    explicacaoDivergencia?: string;
  };
  basesLegaisGerais: BaseLegal[];
  dataAuditoria: string;
}

export interface AlteracaoTributariaRadar {
  id: string;
  titulo: string;
  dataPublicacao: string;
  dataInicioVigencia: string;
  ufAfetada: UF | 'TODAS' | 'CONFAZ';
  segmento: string;
  produtosAfetados: string;
  ncmsAfetados: string[];
  regraAnterior: string;
  novaRegra: string;
  impacto: string;
  fonteOficial: string;
  linkOficial: string;
  remetenteOficial?: string;
  urgencia?: 'CRITICA' | 'ALTA' | 'INFORMATIVA';
  horarioPublicacao?: string;
  categoriaSetorial?: 'MVA_ST' | 'ALIQUOTA' | 'CEST_NCM' | 'CONVENIO' | 'REGULAMENTO' | 'REFORMA' | 'BENEFICIO';
  resumoCurto?: string;
}
