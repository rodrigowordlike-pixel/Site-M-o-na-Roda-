/**
 * Parser de XML de NF-e (Nota Fiscal Eletrônica Brasileira)
 * Suporta XMLs com ou sem namespace, nfeProc, NFe, procNFe, tags com prefixos e variantes de layout.
 */

import { NFeParsed, ItemNFe, EmitenteNFe, DestinatarioNFe, UF } from '../types/fiscal';

/**
 * Localiza o primeiro elemento pelo nome da tag, ignorando namespaces e prefixos
 */
function findElement(parent: Element | Document | null, tagName: string): Element | null {
  if (!parent) return null;

  // 1. Busca padrão
  const direct = parent.getElementsByTagName(tagName);
  if (direct && direct.length > 0) return direct[0];

  // 2. Busca por getElementsByTagNameNS com curinga
  try {
    const nsDirect = (parent as any).getElementsByTagNameNS?.('*', tagName);
    if (nsDirect && nsDirect.length > 0) return nsDirect[0];
  } catch {}

  // 3. Varredura manual por localName ou terminação de nodeName (ex: nfe:det)
  const all = parent.getElementsByTagName('*');
  const lowerTag = tagName.toLowerCase();
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    const loc = (el.localName || el.nodeName).toLowerCase();
    if (loc === lowerTag || loc.endsWith(':' + lowerTag)) {
      return el;
    }
  }

  return null;
}

/**
 * Localiza todos os elementos pelo nome da tag, ignorando namespaces e prefixos
 */
function findElements(parent: Element | Document | null, tagName: string): Element[] {
  if (!parent) return [];

  const lowerTag = tagName.toLowerCase();
  const result: Element[] = [];
  const all = parent.getElementsByTagName('*');

  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    const loc = (el.localName || el.nodeName).toLowerCase();
    if (loc === lowerTag || loc.endsWith(':' + lowerTag)) {
      result.push(el);
    }
  }

  return result;
}

/**
 * Função utilitária para extrair texto de uma tag dentro de um elemento XML
 */
function getText(parent: Element | null, tagName: string): string {
  if (!parent) return '';
  const el = findElement(parent, tagName);
  return el?.textContent?.trim() || '';
}

/**
 * Converte valor textual de moeda/número em float seguro
 */
function getFloat(parent: Element | null, tagName: string, defaultValue = 0): number {
  const str = getText(parent, tagName);
  if (!str) return defaultValue;
  const num = parseFloat(str.replace(',', '.'));
  return isNaN(num) ? defaultValue : num;
}

/**
 * Faz o parse completo de uma string XML de NF-e
 */
export function parseNFeXML(xmlString: string): NFeParsed {
  if (!xmlString || typeof xmlString !== 'string' || !xmlString.trim()) {
    throw new Error('Conteúdo XML vazio ou inválido.');
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString.trim(), 'text/xml');

  // Verificar erros de parse do DOMParser
  const parseError = findElement(xmlDoc, 'parsererror');
  if (parseError) {
    throw new Error(`Arquivo XML inválido ou malformado: ${parseError.textContent?.slice(0, 150)}`);
  }

  // Localizar nó infNFe
  const infNFe = findElement(xmlDoc, 'infNFe');
  if (!infNFe) {
    throw new Error('Estrutura de NF-e inválida: tag <infNFe> não encontrada no arquivo XML.');
  }

  // Chave de Acesso (Id de infNFe, ex: NFe35240212345678000195550010001234561000000018 ou tag chNFe em protNFe)
  const rawId = infNFe.getAttribute('Id') || infNFe.getAttribute('id') || '';
  let chNFe = rawId.replace(/^NFe/i, '').trim();

  const protNFe = findElement(xmlDoc, 'protNFe');
  if (!chNFe && protNFe) {
    chNFe = getText(protNFe, 'chNFe');
  }

  // Dados de Identificação (<ide>)
  const ide = findElement(xmlDoc, 'ide');
  const nNF = getText(ide, 'nNF') || '000000';
  const serie = getText(ide, 'serie') || '1';
  const dhEmi = getText(ide, 'dhEmi') || getText(ide, 'dEmi') || new Date().toISOString();
  const natOp = getText(ide, 'natOp') || 'Operação Fiscal';
  const finNFe = getText(ide, 'finNFe') || '1';
  const tpNF = getText(ide, 'tpNF') || '1';
  const idDest = getText(ide, 'idDest') || '2';
  const indFinal = getText(ide, 'indFinal') || '0';
  const indPres = getText(ide, 'indPres') || '1';

  // Formatador de data amigável
  let dEmiFormatada = dhEmi;
  try {
    if (dhEmi) {
      const d = new Date(dhEmi);
      if (!isNaN(d.getTime())) {
        dEmiFormatada = d.toLocaleDateString('pt-BR');
      }
    }
  } catch {
    // fallback
  }

  // Dados do Emitente (<emit>)
  const emit = findElement(xmlDoc, 'emit');
  const emitEnder = findElement(emit, 'enderEmit');
  const rawCrt = getText(emit, 'CRT') || '3';
  const crt = (rawCrt === '1' || rawCrt === '2' ? rawCrt : '3') as '1' | '2' | '3';
  const rawUfEmit = (getText(emitEnder, 'UF') || getText(emit, 'UF') || 'SP').toUpperCase() as UF;

  const emitente: EmitenteNFe = {
    cnpj: getText(emit, 'CNPJ') || '',
    cpf: getText(emit, 'CPF'),
    xNome: getText(emit, 'xNome') || 'Emitente não identificado',
    xFant: getText(emit, 'xFant'),
    ie: getText(emit, 'IE'),
    uf: rawUfEmit,
    cMun: getText(emitEnder, 'cMun'),
    xMun: getText(emitEnder, 'xMun'),
    crt: crt,
    crtDescricao: crt === '1' ? 'Simples Nacional' : crt === '2' ? 'Simples Nacional - excesso de sublimite' : 'Regime Normal (RPA / Lucro Presumido / Real)',
  };

  // Dados do Destinatário (<dest>)
  const dest = findElement(xmlDoc, 'dest');
  const destEnder = findElement(dest, 'enderDest');
  const rawIndIEDest = (getText(dest, 'indIEDest') || '1') as '1' | '2' | '9';
  const rawUfDest = (getText(destEnder, 'UF') || getText(dest, 'UF') || (rawUfEmit === 'SP' ? 'PR' : 'SP')).toUpperCase() as UF;

  const destinatario: DestinatarioNFe = {
    cnpj: getText(dest, 'CNPJ') || '',
    cpf: getText(dest, 'CPF'),
    xNome: getText(dest, 'xNome') || 'Destinatário não identificado',
    ie: getText(dest, 'IE'),
    uf: rawUfDest,
    cMun: getText(destEnder, 'cMun'),
    xMun: getText(destEnder, 'xMun'),
    indIEDest: rawIndIEDest,
    indIEDestDescricao: rawIndIEDest === '1' ? 'Contribuinte ICMS' : rawIndIEDest === '2' ? 'Contribuinte Isento' : 'Não Contribuinte',
  };

  // Itens da NF-e (<det>)
  const detElements = findElements(xmlDoc, 'det');
  const itens: ItemNFe[] = [];

  for (let i = 0; i < detElements.length; i++) {
    const det = detElements[i];
    const nItem = parseInt(det.getAttribute('nItem') || `${i + 1}`, 10);
    const prod = findElement(det, 'prod');
    const imposto = findElement(det, 'imposto');

    // Produtos
    const cProd = getText(prod, 'cProd') || `PROD-${i + 1}`;
    const xProd = getText(prod, 'xProd') || `Produto ${i + 1}`;
    const rawNcm = getText(prod, 'NCM').replace(/\D/g, '');
    const ncm = rawNcm || '87082999';
    const cest = getText(prod, 'CEST') || undefined;
    const cfop = getText(prod, 'CFOP') || (emitente.uf !== destinatario.uf ? '6102' : '5102');
    const uCom = getText(prod, 'uCom') || 'UN';
    const qCom = getFloat(prod, 'qCom', 1);
    const vUnCom = getFloat(prod, 'vUnCom', 0);
    const vProdCalc = qCom * vUnCom;
    const vProd = getFloat(prod, 'vProd', vProdCalc > 0 ? vProdCalc : 100);
    const vDesc = getFloat(prod, 'vDesc', 0);
    const vFrete = getFloat(prod, 'vFrete', 0);
    const vSeg = getFloat(prod, 'vSeg', 0);
    const vOutro = getFloat(prod, 'vOutro', 0);

    // ICMS
    const icmsNode = findElement(imposto, 'ICMS');
    let origem = '0';
    let cst = '';
    let csosn = '';
    let vBC = 0;
    let pICMS = 0;
    let vICMS = 0;
    let vBCST = 0;
    let pMVAST = 0;
    let pICMSST = 0;
    let vICMSST = 0;
    let vBCFCP = 0;
    let pFCP = 0;
    let vFCP = 0;
    let vBCFCPST = 0;
    let pFCPST = 0;
    let vFCPST = 0;

    if (icmsNode) {
      // Localizar o nó específico (ex: ICMS00, ICMS10, ICMSSN102, etc.)
      const allIcmsChildren = icmsNode.getElementsByTagName('*');
      for (let j = 0; j < allIcmsChildren.length; j++) {
        const el = allIcmsChildren[j];
        const tag = (el.localName || el.nodeName).toLowerCase();
        if (tag.startsWith('icms')) {
          origem = getText(el, 'orig') || origem;
          cst = getText(el, 'CST') || cst;
          csosn = getText(el, 'CSOSN') || csosn;
          vBC = getFloat(el, 'vBC') || vBC;
          pICMS = getFloat(el, 'pICMS') || pICMS;
          vICMS = getFloat(el, 'vICMS') || vICMS;
          vBCST = getFloat(el, 'vBCST') || vBCST;
          pMVAST = getFloat(el, 'pMVAST') || pMVAST;
          pICMSST = getFloat(el, 'pICMSST') || pICMSST;
          vICMSST = getFloat(el, 'vICMSST') || vICMSST;
          vBCFCP = getFloat(el, 'vBCFCP') || vBCFCP;
          pFCP = getFloat(el, 'pFCP') || pFCP;
          vFCP = getFloat(el, 'vFCP') || vFCP;
          vBCFCPST = getFloat(el, 'vBCFCPST') || vBCFCPST;
          pFCPST = getFloat(el, 'pFCPST') || pFCPST;
          vFCPST = getFloat(el, 'vFCPST') || vFCPST;
        }
      }
    }

    // IPI
    const ipiNode = findElement(imposto, 'IPI');
    let cstIPI = '';
    let vBCIPI = 0;
    let pIPI = 0;
    let vIPI = 0;

    if (ipiNode) {
      const ipiTrib = findElement(ipiNode, 'IPITrib');
      const ipiNT = findElement(ipiNode, 'IPINT');
      if (ipiTrib) {
        cstIPI = getText(ipiTrib, 'CST');
        vBCIPI = getFloat(ipiTrib, 'vBC');
        pIPI = getFloat(ipiTrib, 'pIPI');
        vIPI = getFloat(ipiTrib, 'vIPI');
      } else if (ipiNT) {
        cstIPI = getText(ipiNT, 'CST');
      }
    }

    itens.push({
      nItem,
      cProd,
      xProd,
      ncm,
      cest,
      cfop,
      uCom,
      qCom,
      vUnCom,
      vProd,
      vDesc,
      vFrete,
      vSeg,
      vOutro,
      origem,
      cst,
      csosn,
      vBC,
      pICMS,
      vICMS,
      vBCST,
      pMVAST,
      pICMSST,
      vICMSST,
      vBCFCP,
      pFCP,
      vFCP,
      vBCFCPST,
      pFCPST,
      vFCPST,
      cstIPI,
      vBCIPI,
      pIPI,
      vIPI,
    });
  }

  // Se por algum motivo det não foi encontrado, cria pelo menos um item seguro baseado no XML
  if (itens.length === 0) {
    const prod = findElement(xmlDoc, 'prod');
    if (prod) {
      itens.push({
        nItem: 1,
        cProd: getText(prod, 'cProd') || 'PROD-01',
        xProd: getText(prod, 'xProd') || 'Produto sem tag det explícita',
        ncm: getText(prod, 'NCM').replace(/\D/g, '') || '87082999',
        cest: getText(prod, 'CEST') || undefined,
        cfop: getText(prod, 'CFOP') || '6102',
        uCom: getText(prod, 'uCom') || 'UN',
        qCom: getFloat(prod, 'qCom', 1),
        vUnCom: getFloat(prod, 'vUnCom', 100),
        vProd: getFloat(prod, 'vProd', 100),
        vDesc: getFloat(prod, 'vDesc', 0),
        vFrete: getFloat(prod, 'vFrete', 0),
        vSeg: getFloat(prod, 'vSeg', 0),
        vOutro: getFloat(prod, 'vOutro', 0),
        origem: '0',
        cst: '00',
        csosn: '',
        vBC: 100,
        pICMS: 12,
        vICMS: 12,
        vBCST: 0,
        pMVAST: 0,
        pICMSST: 0,
        vICMSST: 0,
        vBCFCP: 0,
        pFCP: 0,
        vFCP: 0,
        vBCFCPST: 0,
        pFCPST: 0,
        vFCPST: 0,
        cstIPI: '',
        vBCIPI: 0,
        pIPI: 0,
        vIPI: 0,
      });
    }
  }

  // Totais da NF-e (<total><ICMSTot>)
  const total = findElement(xmlDoc, 'total');
  const icmsTot = findElement(total, 'ICMSTot');

  const vProdTotal = itens.reduce((acc, it) => acc + it.vProd, 0);
  const vFreteTotal = itens.reduce((acc, it) => acc + it.vFrete, 0);
  const vDescTotal = itens.reduce((acc, it) => acc + it.vDesc, 0);
  const vIpiTotal = itens.reduce((acc, it) => acc + it.vIPI, 0);

  const totaisXML = {
    vProd: getFloat(icmsTot, 'vProd', vProdTotal),
    vFrete: getFloat(icmsTot, 'vFrete', vFreteTotal),
    vSeg: getFloat(icmsTot, 'vSeg', 0),
    vDesc: getFloat(icmsTot, 'vDesc', vDescTotal),
    vOutro: getFloat(icmsTot, 'vOutro', 0),
    vBC: getFloat(icmsTot, 'vBC', 0),
    vICMS: getFloat(icmsTot, 'vICMS', 0),
    vBCST: getFloat(icmsTot, 'vBCST', 0),
    vST: getFloat(icmsTot, 'vST', 0),
    vFCP: getFloat(icmsTot, 'vFCP', 0),
    vFCPST: getFloat(icmsTot, 'vFCPST', 0),
    vIPI: getFloat(icmsTot, 'vIPI', vIpiTotal),
    vNF: getFloat(icmsTot, 'vNF', vProdTotal + vFreteTotal + vIpiTotal - vDescTotal),
  };

  return {
    nNF,
    serie,
    dhEmi,
    dEmiFormatada,
    chNFe,
    natOp,
    finNFe,
    tpNF,
    idDest,
    indFinal,
    indPres,
    emitente,
    destinatario,
    itens,
    totaisXML,
  };
}
