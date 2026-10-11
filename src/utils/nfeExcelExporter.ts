/**
 * Exportador Inteligente de Produtos de NF-e para Planilha Excel (.xlsx)
 * Padrão Obrigatório de 8 Colunas Rigorosamente Ordenadas:
 * 1. Cod DANF
 * 2. Descrição
 * 3. Aplicação
 * 4. Preço líquido
 * 5. Imposto
 * 6. Cód. de barras
 * 7. Cód. CEST
 * 8. NCM
 */

import * as XLSX from 'xlsx';
import { ItemNFe } from '../types/fiscal';
import { interpretarDescricaoAutopeca } from './productDescriptionParser';

export interface ExportProductRow {
  codDanf: string;
  descricao: string;
  aplicacao: string;
  precoLiquido: number;
  imposto: number;
  codBarras: string;
  codCest: string;
  ncm: string;
  originalDescription: string;
  confianca: 'ALTA' | 'REVISAR';
  motivo?: string;
  nItem: number;
  qCom: number;
  uCom: string;
}

/**
 * Converte os itens da NF-e no formato estruturado para edição e exportação
 */
export function mapearItensParaExportacao(itens: ItemNFe[]): ExportProductRow[] {
  return itens.map((item, idx) => {
    const rawDesc = item.xProd || `Item ${item.nItem || idx + 1}`;
    const parsed = interpretarDescricaoAutopeca(rawDesc);

    // 1. Cod DANF (cProd do XML)
    const codDanf = String(item.cProd || `PROD-${item.nItem || idx + 1}`).trim();

    // 2 & 3. Descrição e Aplicação inteligentes
    const descricao = parsed.descricao;
    const aplicacao = parsed.aplicacao;

    // 4. Preço líquido
    // Preço líquido unitário comercial (valor do produto deduzido de desconto unitário)
    const qCom = item.qCom > 0 ? item.qCom : 1;
    const vProdLiquido = Math.max(0, (item.vProd || 0) - (item.vDesc || 0));
    const precoLiquido = Math.round((vProdLiquido / qCom) * 100) / 100;

    // 5. Imposto
    // Soma de tributos aplicáveis ao item (ST + IPI, ou ICMS-ST unitário)
    const tributosTotais = (item.vICMSST || 0) + (item.vIPI || 0);
    const impostoUnitario = tributosTotais > 0 ? Math.round((tributosTotais / qCom) * 100) / 100 : 0;

    // 6. Cód. de barras (cEAN ou cEANTrib oficial do XML)
    let codBarras = '';
    const rawEan = String(item.cEAN || item.cEANTrib || '').trim();
    if (rawEan && !rawEan.toUpperCase().includes('SEM GTIN') && !rawEan.toUpperCase().includes('SEMGTIN')) {
      codBarras = rawEan;
    }

    // 7. Cód. CEST (preservando formato e zeros à esquerda)
    const rawCest = (item.cest || '').replace(/\D/g, '');
    const codCest = rawCest ? rawCest.padStart(7, '0') : '';

    // 8. NCM (preservando dígitos e zeros à esquerda)
    const rawNcm = (item.ncm || '').replace(/\D/g, '');
    const ncm = rawNcm ? rawNcm.padStart(8, '0') : '';

    return {
      codDanf,
      descricao,
      aplicacao,
      precoLiquido,
      imposto: impostoUnitario,
      codBarras,
      codCest,
      ncm,
      originalDescription: rawDesc,
      confianca: parsed.confianca,
      motivo: parsed.motivo,
      nItem: item.nItem || idx + 1,
      qCom,
      uCom: item.uCom || 'UN',
    };
  });
}

/**
 * Gera e realiza o download do arquivo .xlsx seguindo RIGOROSAMENTE as 8 colunas obrigatórias
 */
export function exportarProdutosParaExcel(
  rows: ExportProductRow[],
  nomeArquivoBase: string = 'Produtos_NFe_Cadastro'
): void {
  // 1. Cabeçalhos padronizados obrigatórios
  const HEADERS = [
    'Cod DANF',
    'Descrição',
    'Aplicação',
    'Preço líquido',
    'Imposto',
    'Cód. de barras',
    'Cód. CEST',
    'NCM',
  ];

  // 2. Construção da matriz de células tipadas para manter a integridade absoluta dos códigos
  // (Strings para códigos e barras, Numbers para preços e impostos)
  const worksheetData: any[][] = [HEADERS];

  rows.forEach((r) => {
    worksheetData.push([
      r.codDanf,
      r.descricao,
      r.aplicacao,
      r.precoLiquido,
      r.imposto,
      r.codBarras,
      r.codCest,
      r.ncm,
    ]);
  });

  // Cria a planilha a partir dos dados
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 3. Formatação explícita de tipos de célula para evitar notação científica ou perda de zeros
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:H1');

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    // Coluna 0: Cod DANF (String)
    const cellA = worksheet[XLSX.utils.encode_cell({ r: R, c: 0 })];
    if (cellA) cellA.t = 's';

    // Coluna 1: Descrição (String)
    const cellB = worksheet[XLSX.utils.encode_cell({ r: R, c: 1 })];
    if (cellB) cellB.t = 's';

    // Coluna 2: Aplicação (String)
    const cellC = worksheet[XLSX.utils.encode_cell({ r: R, c: 2 })];
    if (cellC) cellC.t = 's';

    // Coluna 3: Preço líquido (Number com 2 casas)
    const cellD = worksheet[XLSX.utils.encode_cell({ r: R, c: 3 })];
    if (cellD) {
      cellD.t = 'n';
      cellD.z = '#,##0.00';
    }

    // Coluna 4: Imposto (Number com 2 casas)
    const cellE = worksheet[XLSX.utils.encode_cell({ r: R, c: 4 })];
    if (cellE) {
      cellE.t = 'n';
      cellE.z = '#,##0.00';
    }

    // Coluna 5: Cód. de barras (String para NUNCA virar 7.89E+12)
    const cellF = worksheet[XLSX.utils.encode_cell({ r: R, c: 5 })];
    if (cellF) cellF.t = 's';

    // Coluna 6: Cód. CEST (String para NUNCA perder zero inicial)
    const cellG = worksheet[XLSX.utils.encode_cell({ r: R, c: 6 })];
    if (cellG) cellG.t = 's';

    // Coluna 7: NCM (String para NUNCA perder zero inicial)
    const cellH = worksheet[XLSX.utils.encode_cell({ r: R, c: 7 })];
    if (cellH) cellH.t = 's';
  }

  // 4. Largura otimizada para cada coluna
  worksheet['!cols'] = [
    { wch: 16 }, // Cod DANF
    { wch: 40 }, // Descrição
    { wch: 35 }, // Aplicação
    { wch: 15 }, // Preço líquido
    { wch: 14 }, // Imposto
    { wch: 18 }, // Cód. de barras
    { wch: 14 }, // Cód. CEST
    { wch: 14 }, // NCM
  ];

  // 5. Ativa auto-filtro no cabeçalho
  worksheet['!autofilter'] = { ref: `A1:H${rows.length + 1}` };

  // 6. Cria a pasta de trabalho (Workbook) e adiciona a aba
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadastro de Produtos');

  // 7. Sanitiza o nome do arquivo e dispara o download
  const sanitizedName = nomeArquivoBase.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const filename = `${sanitizedName}.xlsx`;

  XLSX.writeFile(workbook, filename, { bookType: 'xlsx', compression: true });
}
