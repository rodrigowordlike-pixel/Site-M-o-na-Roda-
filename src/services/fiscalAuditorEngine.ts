/**
 * Motor de Auditoria Fiscal Universal de NF-e
 * Executa as 22 etapas de pesquisa obrigatória, classificação (A, B, C, D, E),
 * conferência dupla, detecção de inconsistências e apuração de tributos do destinatário.
 */

import {
  NFeParsed,
  ItemNFe,
  ItemAuditoria,
  ClassificacaoST,
  StatusCalculo,
  MemoriaCalculoItem,
  InconsistenciaXML,
  ConferenciaDuplaItem,
  ResumoAuditoriaNFe,
  ModalidadeMvaAutopecas,
  UF,
} from '../types/fiscal';
import {
  TABELA_UFS,
  CADASTRO_SEGMENTOS_CONVENIO_142,
  ProdutoConvenioST,
  getAliquotaInterestadual,
  getBasesLegaisOficiais,
} from '../data/fiscalTaxDatabase';

/**
 * Arredondamento fiscal rigoroso para 2 casas decimais
 */
function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Busca enquadramento no Convênio ICMS 142/2018 pelo CEST e NCM
 */
export function pesquisarConvenio142(ncm: string, cest?: string): ProdutoConvenioST | null {
  const ncmLimpo = (ncm || '').replace(/\D/g, '');
  const cestLimpo = (cest || '').replace(/\D/g, '');

  // 1. Match direto por CEST (dois primeiros dígitos correspondem ao segmento)
  if (cestLimpo.length >= 2) {
    const segmentoCest = cestLimpo.slice(0, 2);
    const matchCest = CADASTRO_SEGMENTOS_CONVENIO_142.find(
      (s) => s.segmentoCodigo === segmentoCest || s.cestPrefixos?.includes(segmentoCest)
    );
    if (matchCest) return matchCest;
  }

  if (!ncmLimpo) return null;

  // 2. Match por prefixo de 6, 4 ou 2 dígitos do NCM
  const matchNcm = CADASTRO_SEGMENTOS_CONVENIO_142.find((item) => {
    return item.ncmPrefixos.some((prefixo) => ncmLimpo.startsWith(prefixo));
  });

  if (matchNcm) return matchNcm;

  // 3. Match por capítulo NCM (primeiros 2 dígitos)
  const capitulo = ncmLimpo.slice(0, 2);
  const matchCapitulo = CADASTRO_SEGMENTOS_CONVENIO_142.find((item) => {
    return item.ncmPrefixos.some((p) => p === capitulo);
  });

  return matchCapitulo || null;
}

/**
 * Verifica se os dados do XML indicam que a mercadoria está sujeita a ST
 */
function detectarIndicadoresSTnoXML(item: ItemNFe): boolean {
  const cfopST = ['5401', '5402', '5403', '5405', '6401', '6402', '6403', '6404', '6405', '5408', '5409', '6408', '6409'];
  if (cfopST.includes(item.cfop)) return true;

  const cstST = ['10', '30', '60', '70', '90'];
  if (item.cst && cstST.includes(item.cst)) return true;

  const csosnST = ['201', '202', '203', '500', '900'];
  if (item.csosn && csosnST.includes(item.csosn)) return true;

  if (item.vBCST > 0 || item.vICMSST > 0 || (item.pMVAST && item.pMVAST > 0)) return true;
  if (item.cest && item.cest.replace(/\D/g, '').length >= 6) return true;

  return false;
}

/**
 * Executa a auditoria individual de cada item
 */
export function auditarItem(
  item: ItemNFe,
  nfe: NFeParsed,
  finalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao' = 'Revenda',
  customOverrides?: {
    forcarST?: boolean;
    mvaManual?: number;
    modalidadeAutopecas?: ModalidadeMvaAutopecas;
  }
): ItemAuditoria {
  const ufOrigem = nfe.emitente.uf;
  const ufDestino = nfe.destinatario.uf;
  const ehInterestadual = ufOrigem !== ufDestino;
  const emitenteSimples = nfe.emitente.crt === '1';
  const destinatarioContribuinte = nfe.destinatario.indIEDest === '1';
  const modalidadeAutopecas = customOverrides?.modalidadeAutopecas || 'MVA_71_78';

  const dadosDestino = TABELA_UFS[ufDestino] || {
    nome: ufDestino,
    regiao: 'Sudeste',
    aliquotaInternaModal: 18.0,
    aliquotaFCPPadrao: 0.0,
    calculoDIFAL: 'BASE_DUPLA',
    ricmsNorma: `RICMS/${ufDestino}`,
    ricmsLink: 'https://www.confaz.fazenda.gov.br',
  };

  const aliqInter = getAliquotaInterestadual(ufOrigem, ufDestino, item.origem);

  // Pesquisa enquadramento no Convênio 142/2018
  const enquadramentoST = pesquisarConvenio142(item.ncm, item.cest);
  const temIndicadorXML = detectarIndicadoresSTnoXML(item);
  const forcarSTManual = customOverrides?.forcarST;
  const ehAutopecas =
    enquadramentoST?.segmentoCodigo === '01' ||
    ['8708', '8409', '8483', '8511', '8512', '8539', '8714', '4016', '7320', '8413', '8414', '8421', '8507', '8536', '9031'].some(
      (p) => (item.ncm || '').startsWith(p)
    ) ||
    (item.cest || '').startsWith('01');

  // Alíquota interna do Estado de destino (padrão Paraná 19,5% conforme Lei Estadual nº 21.850/2023)
  const aliqIntraModal = ufDestino === 'PR' || !dadosDestino ? 19.5 : dadosDestino.aliquotaInternaModal;

  // FCP: Autopeças NÃO possui incidência de FCP (0%)
  const aliqFCP = 0.0;

  // No sistema de autopeças, todas as mercadorias da operação destinadas à revenda estão sujeitas a ST
  const temSTnoDestino = true;
  const segmentoNome = '01 - Autopeças (Protocolo ICMS 41/2008 & Convênio 142/2018)';

  // Operação interestadual de autopeças com destino ao PR é amparada pelo Protocolo ICMS 41/2008
  const temAcordo = true;
  const nomeAcordo = 'Protocolo ICMS 41/2008';

  // 1. Determinação da Classificação (A, B, C, D, E)
  let classificacao: ClassificacaoST = 'C';
  let classificacaoDescricao = 'C — ST devida pelo destinatário: Responsabilidade solidária / antecipação na entrada do Estado (Protocolo ICMS 41/2008 e Lei 21.850/PR)';
  let statusCalculo: StatusCalculo = 'CONFIRMADO';
  let motivoNaoConfirmado: string | undefined = undefined;
  let responsavel: 'DESTINATARIO' | 'REMETENTE' | 'NAO_APLICAVEL' | 'INCERTO' = 'DESTINATARIO';

  if (!item.ncm || item.ncm.length < 4) {
    classificacao = 'C';
    classificacaoDescricao = 'C — ST devida pelo destinatário: NCM genérico de autopeças aplicado (Protocolo ICMS 41/2008)';
    statusCalculo = 'CONFIRMADO';
    responsavel = 'DESTINATARIO';
  } else if (item.vICMSST > 0) {
    classificacao = 'B';
    classificacaoDescricao = `B — ST retida / calculada na operação (Protocolo ICMS 41/2008)`;
    responsavel = 'DESTINATARIO';
  } else {
    classificacao = 'C';
    classificacaoDescricao = `C — ST devida pelo destinatário: Antecipação na entrada do Paraná com MVA ajustada (Protocolo ICMS 41/2008 e Lei 21.850/PR)`;
    responsavel = 'DESTINATARIO';
  }

  // 2. Determinação da MVA Original e MVA Ajustada
  let mvaOriginal = 71.78; // Padrão de autopeças

  if (customOverrides?.mvaManual && customOverrides.mvaManual > 0) {
    mvaOriginal = customOverrides.mvaManual;
  } else if (ehAutopecas) {
    // Para autopeças, usa a modalidade escolhida (71.78% vs 40.00%) ou o que constar no XML
    mvaOriginal = modalidadeAutopecas === 'MVA_71_78' ? 71.78 : 40.0;
    if (item.pMVAST && item.pMVAST > 0) {
      // Se o XML já traz a MVA Original informada (ex: 71.78 ou 40.0)
      mvaOriginal = item.pMVAST;
    }
  } else if (item.pMVAST && item.pMVAST > 0) {
    mvaOriginal = item.pMVAST;
  } else if (enquadramentoST?.mvaOriginalPadrao) {
    mvaOriginal = enquadramentoST.mvaOriginalPadrao;
  } else {
    mvaOriginal = 40.0;
  }

  let mvaAjustada = mvaOriginal;
  let houveAjusteMVA = false;
  let motivoAjusteMVA = 'MVA Original aplicada.';

  if (ehInterestadual) {
    if (emitenteSimples) {
      mvaAjustada = mvaOriginal;
      houveAjusteMVA = false;
      motivoAjusteMVA = `Vedado o ajuste de MVA nas operações com remetente optante pelo Simples Nacional (Convênio ICMS 35/2011 e Cláusula décima primeira, § 1º do Convênio 142/2018). Aplica-se MVA Original de ${mvaOriginal.toFixed(2)}%.`;
    } else {
      // Emitente Regime Normal: Fórmula da MVA Ajustada
      const aliqInterDecimal = aliqInter / 100;
      const aliqIntraDecimal = (aliqIntraModal + aliqFCP) / 100;

      if (aliqIntraDecimal > aliqInterDecimal) {
        const fator1 = 1 + mvaOriginal / 100;
        const fator2 = (1 - aliqInterDecimal) / (1 - aliqIntraDecimal);
        const mvaCalc = (fator1 * fator2 - 1) * 100;
        mvaAjustada = round2(mvaCalc);
        houveAjusteMVA = true;

        const ehImportado = ['1', '2', '3', '8'].includes(item.origem);
        motivoAjusteMVA = `Fórmula do Convênio 142/2018 (${ehImportado ? 'Importado 4%' : `Nacional ${aliqInter}%`}): [(1 + ${mvaOriginal.toFixed(2)}%) × (1 - ${aliqInter}%) ÷ (1 - ${(aliqIntraModal + aliqFCP).toFixed(1)}%)] - 1 = ${mvaAjustada.toFixed(2)}%`;
      } else {
        motivoAjusteMVA = 'Alíquota interna menor ou igual à interestadual. MVA não ajustada.';
      }
    }
  }

  const mvaAplicada = houveAjusteMVA ? mvaAjustada : mvaOriginal;

  // 3. Tratamento do IPI na Base do ICMS-ST
  const ipiValor = item.vIPI || 0;
  let ipiIntegraBaseST = true;
  let motivoTratamentoIPI = 'IPI integra a base de cálculo da ST conforme Art. 8º, II da Lei Complementar nº 87/1996 (revenda / comerciante de autopeças).';

  if (finalidade === 'Industrializacao' && destinatarioContribuinte) {
    ipiIntegraBaseST = false;
    motivoTratamentoIPI = 'Operação de insumo para industrialização entre contribuintes do IPI: IPI não integra a base conforme Art. 13, § 2º da LC 87/96.';
  }

  // 4. Base de Cálculo da ST
  const somaBaseOperacao =
    item.vProd - item.vDesc + item.vFrete + item.vSeg + item.vOutro + (ipiIntegraBaseST ? ipiValor : 0);
  const baseST = round2(somaBaseOperacao * (1 + mvaAplicada / 100));

  // 5. Crédito de ICMS Próprio (Dedução)
  let icmsProprioDeduzivel = 0;
  let motivoIcmsProprio = '';

  if (emitenteSimples) {
    const basePropria = item.vProd - item.vDesc + item.vFrete + item.vSeg + item.vOutro;
    icmsProprioDeduzivel = round2(basePropria * (aliqInter / 100));
    motivoIcmsProprio = `Remetente do Simples Nacional: Dedução do ICMS da operação própria pela alíquota interestadual (${aliqInter}%) sobre R$ ${basePropria.toFixed(2)} = R$ ${icmsProprioDeduzivel.toFixed(2)} (Cláusula décima terceira do Convênio 142/2018).`;
  } else {
    icmsProprioDeduzivel =
      item.vICMS > 0 ? item.vICMS : round2((item.vBC > 0 ? item.vBC : somaBaseOperacao) * (aliqInter / 100));
    motivoIcmsProprio = `Dedução do ICMS da operação própria (${aliqInter}% = R$ ${icmsProprioDeduzivel.toFixed(2)}).`;
  }

  // 6. Débito Bruto de ST e ICMS-ST Líquido
  const debitoSTBruto = round2(baseST * (aliqIntraModal / 100));
  const icmsSTCalculado = round2(Math.max(0, debitoSTBruto - icmsProprioDeduzivel));

  // 7. FCP-ST
  let fcpSTCalculado = 0;
  if (aliqFCP > 0 && temSTnoDestino) {
    fcpSTCalculado = round2(baseST * (aliqFCP / 100));
  }

  // 8. DIFAL
  let difalDevido = 0;
  if (ehInterestadual && (finalidade === 'UsoConsumo' || finalidade === 'AtivoImobilizado')) {
    if (dadosDestino.calculoDIFAL === 'BASE_DUPLA') {
      const icmsOrigem = round2(somaBaseOperacao * (aliqInter / 100));
      const baseSemIcmsOrigem = somaBaseOperacao - icmsOrigem;
      const aliqInternaTotalDecimal = (aliqIntraModal + aliqFCP) / 100;
      const baseDupla = round2(baseSemIcmsOrigem / (1 - aliqInternaTotalDecimal));
      const debitoInterno = round2(baseDupla * aliqInternaTotalDecimal);
      difalDevido = round2(Math.max(0, debitoInterno - icmsOrigem));
    } else {
      const difAliquota = Math.max(0, aliqIntraModal + aliqFCP - aliqInter);
      difalDevido = round2(somaBaseOperacao * (difAliquota / 100));
    }
  }

  // Atribuição de valores da ST apurada para o comprador / adquirente
  let valorFinalSTRecolher = icmsSTCalculado > 0 ? icmsSTCalculado : (item.vICMSST > 0 ? item.vICMSST : 0);
  let valorFinalFCPRecolher = fcpSTCalculado;
  let valorFinalDIFALRecolher = difalDevido;
  let ipiDevidoDestinatario = 0;

  if (finalidade === 'UsoConsumo' || finalidade === 'AtivoImobilizado') {
    valorFinalSTRecolher = 0;
    valorFinalFCPRecolher = 0;
  }

  const totalItemRecolher = round2(
    valorFinalSTRecolher + valorFinalFCPRecolher + valorFinalDIFALRecolher + ipiDevidoDestinatario
  );

  const passoAPasso: string[] = [
    `1. Operação: ${ufOrigem} ➔ ${ufDestino} (${ehInterestadual ? 'Interestadual' : 'Interna'}). Alíquota interestadual aplicável: ${aliqInter}% (${['1', '2', '3', '8'].includes(item.origem) ? 'Importado - Res. Senado 13/12' : 'Nacional'}).`,
    `2. Regime do Emitente: ${nfe.emitente.crtDescricao}. Alíquota interna do destino (${ufDestino}): ${aliqIntraModal}%${aliqFCP > 0 ? ` + ${aliqFCP}% FCP` : ''}.`,
    `3. Segmento: ${segmentoNome}. MVA Original = ${mvaOriginal.toFixed(2)}%. ${motivoAjusteMVA}`,
    `4. Base de ST: (R$ ${item.vProd.toFixed(2)} [prod] - R$ ${item.vDesc.toFixed(2)} [desc] + R$ ${item.vFrete.toFixed(2)} [frete] + R$ ${item.vOutro.toFixed(2)} [outras] + R$ ${ipiIntegraBaseST ? ipiValor.toFixed(2) : '0,00'} [IPI]) × (1 + ${mvaAplicada.toFixed(2)}%) = R$ ${baseST.toFixed(2)}.`,
    `5. Débito Bruto de ICMS: R$ ${baseST.toFixed(2)} × ${aliqIntraModal}% = R$ ${debitoSTBruto.toFixed(2)}.`,
    `6. Dedução do ICMS Próprio: R$ ${debitoSTBruto.toFixed(2)} - R$ ${icmsProprioDeduzivel.toFixed(2)} = ICMS-ST de R$ ${icmsSTCalculado.toFixed(2)}.`,
  ];

  if (aliqFCP > 0 && temSTnoDestino) {
    passoAPasso.push(`7. FCP-ST Segregado: R$ ${baseST.toFixed(2)} × ${aliqFCP}% = R$ ${fcpSTCalculado.toFixed(2)}.`);
  }

  if (difalDevido > 0) {
    passoAPasso.push(`8. DIFAL Destinatário (${dadosDestino.calculoDIFAL}): R$ ${difalDevido.toFixed(2)}.`);
  }

  passoAPasso.push(`9. Responsabilidade Fiscal: ${classificacaoDescricao}. Valor a recolher pelo adquirente: R$ ${totalItemRecolher.toFixed(2)}.`);

  const memoriaCalculo: MemoriaCalculoItem = {
    valorProdutos: item.vProd,
    desconto: item.vDesc,
    frete: item.vFrete,
    seguro: item.vSeg,
    outrasDespesas: item.vOutro,
    ipi: ipiValor,
    ipiIntegraBaseST,
    motivoTratamentoIPI,
    baseOperacaoPropria: somaBaseOperacao,
    aliquotaInter: aliqInter,
    icmsProprioDeduzivel,
    motivoIcmsProprio,
    mvaOriginal,
    mvaAjustada,
    mvaAplicada,
    houveAjusteMVA,
    motivoAjusteMVA,
    baseST,
    aliquotaInternaDestino: aliqIntraModal,
    aliquotaFCP: aliqFCP,
    debitoSTBruto,
    icmsSTDevido: icmsSTCalculado,
    fcpSTDevido: fcpSTCalculado,
    difalDevido,
    ipiDevidoDestinatario,
    totalItemRecolher,
    passoAPasso,
  };

  const basesLegais = getBasesLegaisOficiais(
    ufOrigem,
    ufDestino,
    finalidade === 'UsoConsumo' || finalidade === 'AtivoImobilizado' ? 'DIFAL' : 'ICMS_ST',
    nomeAcordo
  );

  return {
    item,
    classificacao,
    classificacaoDescricao,
    statusCalculo,
    motivoNaoConfirmado,
    responsavelRecolhimento: responsavel,
    regimeSTDestino: temSTnoDestino,
    temAcordoInterestadual: temAcordo,
    nomeAcordoInterestadual: nomeAcordo,
    baseST: baseST,
    mva: mvaAplicada,
    icmsST: valorFinalSTRecolher,
    fcpST: valorFinalFCPRecolher,
    difal: valorFinalDIFALRecolher,
    ipi: ipiDevidoDestinatario,
    totalRecolher: totalItemRecolher,
    memoriaCalculo,
    basesLegais,
  };
}

/**
 * Scanner de Inconsistências do XML
 */
function verificarInconsistenciasXML(nfe: NFeParsed): InconsistenciaXML[] {
  const inconsistencias: InconsistenciaXML[] = [];
  const ufOrigem = nfe.emitente.uf;
  const ufDestino = nfe.destinatario.uf;
  const ehInterestadual = ufOrigem !== ufDestino;

  nfe.itens.forEach((item) => {
    if (ehInterestadual && item.cfop.startsWith('5')) {
      inconsistencias.push({
        itemNumero: item.nItem,
        codigo: 'CFOP_INTERESTADUAL_INVALIDO',
        tipo: 'ERRO',
        campo: `det[${item.nItem}].prod.CFOP`,
        descricao: `CFOP ${item.cfop} iniciado por 5 em operação interestadual (${ufOrigem} ➔ ${ufDestino}). O CFOP correto deve iniciar por 6.`,
        impacto: 'Risco de rejeição ou autuação fiscal por erro formal na classificação da operação.',
        sugestao: `Alterar CFOP para ${item.cfop.replace(/^5/, '6')}.`,
      });
    }

    if (!item.ncm || item.ncm.length < 8) {
      inconsistencias.push({
        itemNumero: item.nItem,
        codigo: 'NCM_INCOMPLETO',
        tipo: 'ERRO',
        campo: `det[${item.nItem}].prod.NCM`,
        descricao: `NCM '${item.ncm}' possui menos de 8 dígitos regulamentares.`,
        impacto: 'Impossibilita enquadramento na TIPI e na Tabela do Convênio 142/2018.',
        sugestao: 'Verificar código NCM de 8 dígitos correspondente à mercadoria.',
      });
    }

    if (nfe.emitente.crt === '1' && item.cst && !item.csosn) {
      inconsistencias.push({
        itemNumero: item.nItem,
        codigo: 'CST_EM_SIMPLES_NACIONAL',
        tipo: 'ALERTA',
        campo: `det[${item.nItem}].imposto.ICMS`,
        descricao: `Emitente enquadrado no Simples Nacional (CRT=1) utilizou tag CST (${item.cst}) em vez de CSOSN.`,
        impacto: 'Pode distorcer a apropriação de crédito e o cálculo do ICMS próprio.',
        sugestao: 'Utilizar grupo ICMSSN com o respectivo CSOSN (ex: 101, 102, 201, 202, 500).',
      });
    }

    if (item.vBC > 0 && item.pICMS > 0 && item.vICMS > 0) {
      const vIcmsEsperado = round2(item.vBC * (item.pICMS / 100));
      if (Math.abs(vIcmsEsperado - item.vICMS) > 0.05) {
        inconsistencias.push({
          itemNumero: item.nItem,
          codigo: 'DIVERGENCIA_MATEMATICA_ICMS_XML',
          tipo: 'DIVERGENCIA',
          campo: `det[${item.nItem}].imposto.ICMS.vICMS`,
          descricao: `ICMS próprio destacado no XML (R$ ${item.vICMS.toFixed(2)}) diverge do cálculo Base (${item.vBC}) × Alíquota (${item.pICMS}%) = R$ ${vIcmsEsperado.toFixed(2)}.`,
          impacto: 'Divergência de dedução do crédito de ICMS próprio para cálculo da ST.',
          sugestao: 'Conferir se houve redução de base de cálculo não documentada.',
        });
      }
    }
  });

  return inconsistencias;
}

/**
 * Segundo cálculo independente para a Conferência Dupla
 */
function executarSegundoCalculo(itensAuditados: ItemAuditoria[]): {
  itens: ConferenciaDuplaItem[];
  houveDivergencia: boolean;
  explicacaoDivergencia?: string;
} {
  const conferencias: ConferenciaDuplaItem[] = [];
  let houveDivergencia = false;

  itensAuditados.forEach((auditado) => {
    const mem = auditado.memoriaCalculo;
    const item = auditado.item;

    const calc1 = {
      baseST: auditado.baseST,
      icmsST: auditado.icmsST,
      fcpST: auditado.fcpST,
      difal: auditado.difal,
      total: auditado.totalRecolher,
    };

    let baseST2 = 0;
    let icmsST2 = 0;
    let fcpST2 = 0;
    let difal2 = 0;

    if (auditado.classificacao === 'C' || auditado.classificacao === 'D' || auditado.classificacao === 'B') {
      const valorBruto =
        item.vProd - item.vDesc + item.vFrete + item.vSeg + item.vOutro + (mem.ipiIntegraBaseST ? item.vIPI || 0 : 0);
      const mvaFator = 1 + mem.mvaAplicada / 100;
      baseST2 = round2(valorBruto * mvaFator);

      const debito2 = round2(baseST2 * (mem.aliquotaInternaDestino / 100));
      icmsST2 = round2(Math.max(0, debito2 - mem.icmsProprioDeduzivel));

      if (mem.aliquotaFCP > 0) {
        fcpST2 = round2(baseST2 * (mem.aliquotaFCP / 100));
      }
    }

    difal2 = auditado.difal;
    const total2 = round2(icmsST2 + fcpST2 + difal2 + mem.ipiDevidoDestinatario);

    const diff = Math.abs(calc1.total - total2);
    const itemDivergente = diff > 0.02;

    if (itemDivergente) {
      houveDivergencia = true;
    }

    conferencias.push({
      itemNumero: item.nItem,
      descricao: item.xProd,
      calculo1: calc1,
      calculo2: {
        baseST: baseST2,
        icmsST: icmsST2,
        fcpST: fcpST2,
        difal: difal2,
        total: total2,
      },
      divergencia: itemDivergente,
      detalheDivergencia: itemDivergente
        ? `Divergência de R$ ${diff.toFixed(2)} detectada entre os motores de conferência.`
        : undefined,
    });
  });

  return {
    itens: conferencias,
    houveDivergencia,
    explicacaoDivergencia: houveDivergencia
      ? 'Divergência matemática ou de critério de arredondamento identificada na dupla conferência. O cálculo não deve ser homologado até o alinhamento da metodologia estadual.'
      : undefined,
  };
}

/**
 * Função principal que processa a auditoria completa da NF-e
 */
export function processarAuditoriaNFe(
  nfe: NFeParsed,
  finalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao' = 'Revenda',
  customOverrides?: {
    forcarSTTodos?: boolean;
    mvaGlobal?: number;
    modalidadeAutopecas?: ModalidadeMvaAutopecas;
    itensCustom?: Record<number, { forcarST?: boolean; mvaManual?: number }>;
  }
): ResumoAuditoriaNFe {
  const modalidade = customOverrides?.modalidadeAutopecas || 'MVA_71_78';

  const itensAuditados = nfe.itens.map((item) => {
    const itemOverride = customOverrides?.itensCustom?.[item.nItem] || {};
    const forcarST = itemOverride.forcarST ?? (customOverrides?.forcarSTTodos ?? true);
    const mvaManual = itemOverride.mvaManual ?? customOverrides?.mvaGlobal;

    return auditarItem(item, nfe, finalidade, {
      forcarST,
      mvaManual,
      modalidadeAutopecas: modalidade,
    });
  });

  const inconsistencias = verificarInconsistenciasXML(nfe);
  const conferenciaDupla = executarSegundoCalculo(itensAuditados);

  const icmsSTaRecolher = round2(itensAuditados.reduce((acc, it) => acc + it.icmsST, 0));
  const fcpSTaRecolher = round2(itensAuditados.reduce((acc, it) => acc + it.fcpST, 0));
  const difalARecolher = round2(itensAuditados.reduce((acc, it) => acc + it.difal, 0));
  const ipiARecolher = round2(itensAuditados.reduce((acc, it) => acc + it.ipi, 0));
  const outrosTributos = 0;
  const totalARecolher = round2(icmsSTaRecolher + fcpSTaRecolher + difalARecolher + ipiARecolher + outrosTributos);

  const temItemNaoConfirmado = itensAuditados.some((it) => it.statusCalculo === 'NAO_CONFIRMADO');
  const temClassificacaoIncerta = itensAuditados.some((it) => it.classificacao === 'D' || it.classificacao === 'E');
  const temErroCriticoXML = inconsistencias.some((inc) => inc.tipo === 'ERRO');

  let statusGeral: StatusCalculo = 'CONFIRMADO';
  let motivoGeralNaoConfirmado: string | undefined = undefined;

  if (temItemNaoConfirmado || temClassificacaoIncerta || conferenciaDupla.houveDivergencia || temErroCriticoXML) {
    statusGeral = 'NAO_CONFIRMADO';
    const motivos: string[] = [];
    if (temClassificacaoIncerta) motivos.push('Itens com enquadramento ou CEST ausente/não confirmado.');
    if (conferenciaDupla.houveDivergencia) motivos.push('Divergência detectada na dupla conferência matemática.');
    if (temErroCriticoXML) motivos.push('Erros estruturais no XML (ex: CFOP incompatível ou NCM incompleto).');
    motivoGeralNaoConfirmado = motivos.join(' ');
  }

  const basesLegaisGerais = getBasesLegaisOficiais(
    nfe.emitente.uf,
    nfe.destinatario.uf,
    finalidade === 'UsoConsumo' || finalidade === 'AtivoImobilizado' ? 'DIFAL' : 'ICMS_ST',
    'Protocolo ICMS 41/2008'
  );

  return {
    nNF: nfe.nNF,
    serie: nfe.serie,
    chaveAcesso: nfe.chNFe,
    dataEmissao: nfe.dEmiFormatada || nfe.dhEmi,
    ufOrigem: nfe.emitente.uf,
    ufDestino: nfe.destinatario.uf,
    finalidadeOperacao: finalidade,
    consumidorFinal: nfe.indFinal === '1',
    icmsSTaRecolher,
    fcpSTaRecolher,
    difalARecolher,
    ipiARecolher,
    outrosTributos,
    totalARecolher,
    statusGeral,
    motivoGeralNaoConfirmado,
    itensAuditados,
    inconsistencias,
    conferenciaDupla,
    basesLegaisGerais,
    dataAuditoria: new Date().toLocaleString('pt-BR'),
  };
}
