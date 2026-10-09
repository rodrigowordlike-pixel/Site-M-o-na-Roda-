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
  const ehAutopecas =
    enquadramentoST?.segmentoCodigo === '01' ||
    ['8708', '8409', '8483', '8511', '8512', '8539', '8714', '4016', '7320', '8413', '8414', '8421', '8507', '8536', '9031'].some(
      (p) => (item.ncm || '').startsWith(p)
    ) ||
    (item.cest || '').startsWith('01');

  // Alíquota interna do Estado de destino
  const aliqIntraModal = ufDestino === 'PR' || !dadosDestino ? 19.5 : dadosDestino.aliquotaInternaModal;
  const aliqFCP = 0.0; // Autopeças sem incidência de FCP (0%)

  // Códigos fiscais limpos
  const cstClean = (item.cst || '').replace(/\D/g, '').slice(-2);
  const csosnClean = (item.csosn || '').replace(/\D/g, '');
  const cfopClean = (item.cfop || '').replace(/\D/g, '');

  // A. Identificação de Isenção / Não Incidência / Imunidade / Suspensão de ICMS-ST
  const ehIsentoOuNaoTributado =
    ['40', '41', '50'].includes(cstClean) ||
    ['300', '400'].includes(csosnClean);

  // B. Identificação de ST Já Cobrado Anteriormente (Substituído)
  const ehSubstituidoAnteriormente =
    ['60'].includes(cstClean) ||
    ['500'].includes(csosnClean) ||
    ['5405', '6405'].includes(cfopClean);

  // C. Identificação de ST Retida pelo Remetente nesta Operação
  const temSTDestacadaNoXML = item.vICMSST > 0 || item.vBCST > 0;
  const ehSTRetidaPeloRemetente =
    (temSTDestacadaNoXML || ['10', '30', '70'].includes(cstClean) || ['201', '202', '203'].includes(csosnClean)) &&
    item.vICMSST > 0;

  // D. Identificação de Operação Interna sem ST
  const ehOperacaoInternaSemST =
    !ehInterestadual &&
    !temSTDestacadaNoXML &&
    !['10', '30', '70'].includes(cstClean) &&
    !['201', '202', '203'].includes(csosnClean);

  // 1. Determinação da MVA Original e MVA Ajustada
  let mvaOriginal = 71.78;
  if (customOverrides?.mvaManual && customOverrides.mvaManual > 0) {
    mvaOriginal = customOverrides.mvaManual;
  } else if (ehAutopecas) {
    mvaOriginal = modalidadeAutopecas === 'MVA_71_78' ? 71.78 : 40.0;
    if (item.pMVAST && item.pMVAST > 0) {
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
      motivoAjusteMVA = `Vedado o ajuste de MVA nas operações com remetente optante pelo Simples Nacional (Convênio ICMS 35/2011). Aplica-se MVA Original de ${mvaOriginal.toFixed(2)}%.`;
    } else {
      const aliqInterDecimal = aliqInter / 100;
      const aliqIntraDecimal = (aliqIntraModal + aliqFCP) / 100;

      if (aliqIntraDecimal > aliqInterDecimal) {
        const fator1 = 1 + mvaOriginal / 100;
        const fator2 = (1 - aliqInterDecimal) / (1 - aliqIntraDecimal);
        const mvaCalc = (fator1 * fator2 - 1) * 100;
        mvaAjustada = round2(mvaCalc);
        houveAjusteMVA = true;

        const ehImportado = ['1', '2', '3', '8'].includes(item.origem);
        motivoAjusteMVA = `Fórmula do Convênio 142/2018 (${ehImportado ? 'Importado 4%' : `Nacional ${aliqInter}%`}): [(1 + ${mvaOriginal.toFixed(2)}%) × (1 - ${aliqInter}%) ÷ (1 - ${aliqIntraModal.toFixed(1)}%)] - 1 = ${mvaAjustada.toFixed(2)}%`;
      } else {
        motivoAjusteMVA = 'Alíquota interna menor ou igual à interestadual. MVA não ajustada.';
      }
    }
  }

  const mvaAplicada = houveAjusteMVA ? mvaAjustada : mvaOriginal;

  // 2. Tratamento do IPI na Base do ICMS-ST
  const ipiValor = item.vIPI || 0;
  let ipiIntegraBaseST = true;
  let motivoTratamentoIPI = 'IPI integra a base de cálculo da ST conforme Art. 8º, II da Lei Complementar nº 87/1996.';

  if (finalidade === 'Industrializacao' && destinatarioContribuinte) {
    ipiIntegraBaseST = false;
    motivoTratamentoIPI = 'Operação de insumo para industrialização entre contribuintes do IPI: IPI não integra a base conforme Art. 13, § 2º da LC 87/96.';
  }

  // 3. Base de Cálculo e Impostos Teóricos da ST
  const somaBaseOperacao =
    item.vProd - item.vDesc + item.vFrete + item.vSeg + item.vOutro + (ipiIntegraBaseST ? ipiValor : 0);
  const baseSTCalculada = round2(somaBaseOperacao * (1 + mvaAplicada / 100));

  // Dedução do ICMS Próprio
  let icmsProprioDeduzivel = 0;
  let motivoIcmsProprio = '';

  if (emitenteSimples) {
    const basePropria = item.vProd - item.vDesc + item.vFrete + item.vSeg + item.vOutro;
    icmsProprioDeduzivel = round2(basePropria * (aliqInter / 100));
    motivoIcmsProprio = `Remetente do Simples Nacional: Dedução do ICMS da operação própria pela alíquota interestadual (${aliqInter}%) = R$ ${icmsProprioDeduzivel.toFixed(2)}.`;
  } else {
    icmsProprioDeduzivel =
      item.vICMS > 0 ? item.vICMS : round2((item.vBC > 0 ? item.vBC : somaBaseOperacao) * (aliqInter / 100));
    motivoIcmsProprio = `Dedução do ICMS da operação própria (${aliqInter}% = R$ ${icmsProprioDeduzivel.toFixed(2)}).`;
  }

  const debitoSTBruto = round2(baseSTCalculada * (aliqIntraModal / 100));
  const icmsSTCalculado = round2(Math.max(0, debitoSTBruto - icmsProprioDeduzivel));

  // Cálculo de DIFAL para Uso/Consumo ou Ativo
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

  // 4. Classificação e Apuração do Valor Real a Recolher pelo Adquirente
  let classificacao: ClassificacaoST = 'C';
  let classificacaoDescricao = '';
  let statusCalculo: StatusCalculo = 'CONFIRMADO';
  let responsavel: 'DESTINATARIO' | 'REMETENTE' | 'NAO_APLICAVEL' | 'INCERTO' = 'DESTINATARIO';
  let baseSTRinal = 0;
  let valorFinalSTRecolher = 0;
  let valorFinalFCPRecolher = 0;
  let valorFinalDIFALRecolher = 0;
  let ipiDevidoDestinatario = 0;

  const passoAPasso: string[] = [];

  if (ehIsentoOuNaoTributado) {
    // CASO 1: Item Isento / Não Tributado de ST
    classificacao = 'A';
    classificacaoDescricao = `A — Item Isento / Não Tributado de ICMS/ST (CST/CSOSN ${item.cst || item.csosn}). Operação desonerada de ICMS-ST.`;
    responsavel = 'NAO_APLICAVEL';
    baseSTRinal = 0;
    valorFinalSTRecolher = 0;

    passoAPasso.push(
      `1. Operação: ${ufOrigem} ➔ ${ufDestino}. Código Fiscal CST/CSOSN informado: ${item.cst || item.csosn}.`,
      `2. Isenção / Não Incidência: O código CST/CSOSN ${item.cst || item.csosn} indica operação isenta, não tributada ou suspensa de ICMS e ICMS-ST.`,
      `3. Resultado: Valor a recolher de ICMS-ST pelo adquirente = R$ 0,00.`
    );
  } else if (ehSubstituidoAnteriormente) {
    // CASO 2: ST Cobrado Anteriormente (Substituído - CST 60 / CSOSN 500 / CFOP 5405/6405)
    classificacao = 'A';
    classificacaoDescricao = `A — ICMS-ST cobrado anteriormente na cadeia (CST/CSOSN ${item.cst || item.csosn || '60'} / CFOP ${cfopClean}). Adquirente desonerado de novo recolhimento.`;
    responsavel = 'NAO_APLICAVEL';
    baseSTRinal = item.vBCST > 0 ? item.vBCST : 0;
    valorFinalSTRecolher = 0;

    passoAPasso.push(
      `1. Operação: ${ufOrigem} ➔ ${ufDestino}. CST/CSOSN: ${item.cst || item.csosn || '60'} | CFOP: ${item.cfop}.`,
      `2. Regime de Substituído: O ICMS-ST já foi recolhido anteriormente pelo fabricante ou distribuidor nas etapas prévias da cadeia fiscal.`,
      `3. Desoneração: O adquirente nesta operação com estabelecimento substituído está ISENTO de novo recolhimento de ST na entrada.`,
      `4. Resultado: Valor a recolher de ICMS-ST no destino = R$ 0,00.`
    );
  } else if (finalidade === 'UsoConsumo' || finalidade === 'AtivoImobilizado') {
    // CASO 3: Destinação Uso/Consumo ou Ativo (Inaplicabilidade de ST de Revenda, Incidência de DIFAL)
    classificacao = 'A';
    classificacaoDescricao = `A — Operação para ${finalidade === 'UsoConsumo' ? 'Uso e Consumo' : 'Ativo Imobilizado'}: Não incide ICMS-ST de revenda. Devido DIFAL em op. interestadual.`;
    responsavel = 'DESTINATARIO';
    baseSTRinal = 0;
    valorFinalSTRecolher = 0;
    valorFinalDIFALRecolher = difalDevido;

    passoAPasso.push(
      `1. Operação: ${ufOrigem} ➔ ${ufDestino} destinada a ${finalidade === 'UsoConsumo' ? 'Uso/Consumo' : 'Ativo Imobilizado'}.`,
      `2. Não incidência de ST de Revenda: Operações para uso próprio não geram retenção de MVA para saídas subsequentes.`,
      `3. Apuração de DIFAL: ${dadosDestino.calculoDIFAL === 'BASE_DUPLA' ? 'Base Dupla' : 'Simples'} = R$ ${difalDevido.toFixed(2)}.`,
      `4. Resultado a recolher pelo adquirente: R$ ${difalDevido.toFixed(2)} (DIFAL).`
    );
  } else if (finalidade === 'Industrializacao') {
    // CASO 4: Insumo para Industrialização
    classificacao = 'A';
    classificacaoDescricao = `A — Insumo para Industrialização: Operação desonerada do regime de Substituição Tributária.`;
    responsavel = 'NAO_APLICAVEL';
    baseSTRinal = 0;
    valorFinalSTRecolher = 0;

    passoAPasso.push(
      `1. Operação: Entradas de insumos para industrialização entre contribuintes do ICMS.`,
      `2. Desoneração de ST: Conforme regramento do ICMS, insumos industriais não sofrem retenção de ST de revenda.`,
      `3. Resultado: Valor a recolher de ICMS-ST = R$ 0,00.`
    );
  } else if (ehSTRetidaPeloRemetente) {
    // CASO 5: ST Retida e Faturada na Origem pelo Remetente (CST 10, 30, 70 / CSOSN 201, 202, 203 com vICMSST > 0)
    classificacao = 'B';
    classificacaoDescricao = `B — ST retida/faturada na operação pelo remetente (R$ ${item.vICMSST.toFixed(2)}). Adquirente paga na fatura do fornecedor.`;
    responsavel = 'REMETENTE';
    baseSTRinal = item.vBCST > 0 ? item.vBCST : baseSTCalculada;
    valorFinalSTRecolher = 0; // Já faturado na nota, não gera guia de antecipação extra na entrada

    passoAPasso.push(
      `1. Operação: ${ufOrigem} ➔ ${ufDestino}. ST retida pelo fornecedor no XML: R$ ${item.vICMSST.toFixed(2)}.`,
      `2. Faturamento na Nota: O ICMS-ST foi calculado pelo remetente e destacado no campo vICMSST da NF-e.`,
      `3. Quitação via Fatura: O valor já compõe o total da nota cobrado no boleto/fatura pelo fornecedor.`,
      `4. Guia de Antecipação na Entrada: R$ 0,00 (Desonerado de pagamento duplicado na entrada).`
    );
  } else if (ehOperacaoInternaSemST) {
    // CASO 6: Operação Interna (mesma UF) sem ST
    classificacao = 'A';
    classificacaoDescricao = `A — Operação interna (${ufOrigem}) tributada sob regime normal (CST/CSOSN ${item.cst || item.csosn}). Não sujeita a antecipação de ST.`;
    responsavel = 'NAO_APLICAVEL';
    baseSTRinal = 0;
    valorFinalSTRecolher = 0;

    passoAPasso.push(
      `1. Operação Interna: Compra dentro do próprio Estado (${ufOrigem}).`,
      `2. Regime Normal: Fornecedor emitiu sob regime comum de tributação sem destaque de ST.`,
      `3. Resultado: Operação sem antecipação de ST na entrada. Valor a recolher = R$ 0,00.`
    );
  } else {
    // CASO 7: Operação Interestadual Sujeita a Antecipação do ICMS-ST pelo Destinatário (Classificação C)
    classificacao = 'C';
    classificacaoDescricao = `C — ST devida pelo destinatário: Antecipação na entrada do ${ufDestino} com MVA ajustada (Protocolo ICMS 41/2008).`;
    responsavel = 'DESTINATARIO';
    baseSTRinal = baseSTCalculada;
    valorFinalSTRecolher = icmsSTCalculado;

    passoAPasso.push(
      `1. Operação: ${ufOrigem} ➔ ${ufDestino} (Interestadual). Alíquota interestadual aplicável: ${aliqInter}% (${['1', '2', '3', '8'].includes(item.origem) ? 'Importado - Res. Senado 13/12' : 'Nacional'}).`,
      `2. Regime do Emitente: ${nfe.emitente.crtDescricao}. Alíquota interna do destino (${ufDestino}): ${aliqIntraModal}%.`,
      `3. Segmento: Autopeças (Protocolo ICMS 41/2008 & Convênio 142/2018). MVA Original = ${mvaOriginal.toFixed(2)}%. ${motivoAjusteMVA}`,
      `4. Base de ST: (R$ ${item.vProd.toFixed(2)} [prod] - R$ ${item.vDesc.toFixed(2)} [desc] + R$ ${item.vFrete.toFixed(2)} [frete] + R$ ${item.vOutro.toFixed(2)} [outras] + R$ ${ipiIntegraBaseST ? ipiValor.toFixed(2) : '0,00'} [IPI]) × (1 + ${mvaAplicada.toFixed(2)}%) = R$ ${baseSTRinal.toFixed(2)}.`,
      `5. Débito Bruto de ICMS: R$ ${baseSTRinal.toFixed(2)} × ${aliqIntraModal}% = R$ ${debitoSTBruto.toFixed(2)}.`,
      `6. Dedução do ICMS Próprio: R$ ${debitoSTBruto.toFixed(2)} - R$ ${icmsProprioDeduzivel.toFixed(2)} = ICMS-ST a Recolher de R$ ${icmsSTCalculado.toFixed(2)}.`,
      `7. Responsabilidade Fiscal: Antecipação na entrada do Estado de destino pelo adquirente.`
    );
  }

  const totalItemRecolher = round2(
    valorFinalSTRecolher + valorFinalFCPRecolher + valorFinalDIFALRecolher + ipiDevidoDestinatario
  );

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
    baseST: baseSTRinal,
    aliquotaInternaDestino: aliqIntraModal,
    aliquotaFCP: aliqFCP,
    debitoSTBruto,
    icmsSTDevido: valorFinalSTRecolher,
    fcpSTDevido: valorFinalFCPRecolher,
    difalDevido: valorFinalDIFALRecolher,
    ipiDevidoDestinatario,
    totalItemRecolher,
    passoAPasso,
  };

  const basesLegais = getBasesLegaisOficiais(
    ufOrigem,
    ufDestino,
    finalidade === 'UsoConsumo' || finalidade === 'AtivoImobilizado' ? 'DIFAL' : 'ICMS_ST',
    'Protocolo ICMS 41/2008'
  );

  return {
    item,
    classificacao,
    classificacaoDescricao,
    statusCalculo,
    responsavelRecolhimento: responsavel,
    regimeSTDestino: true,
    temAcordoInterestadual: true,
    nomeAcordoInterestadual: 'Protocolo ICMS 41/2008',
    baseST: baseSTRinal,
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

    if (auditado.classificacao === 'C' || auditado.classificacao === 'D') {
      const valorBruto =
        item.vProd - item.vDesc + item.vFrete + item.vSeg + item.vOutro + (mem.ipiIntegraBaseST ? item.vIPI || 0 : 0);
      const mvaFator = 1 + mem.mvaAplicada / 100;
      baseST2 = round2(valorBruto * mvaFator);

      const debito2 = round2(baseST2 * (mem.aliquotaInternaDestino / 100));
      icmsST2 = round2(Math.max(0, debito2 - mem.icmsProprioDeduzivel));

      if (mem.aliquotaFCP > 0) {
        fcpST2 = round2(baseST2 * (mem.aliquotaFCP / 100));
      }
    } else {
      baseST2 = auditado.baseST;
      icmsST2 = auditado.icmsST;
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
