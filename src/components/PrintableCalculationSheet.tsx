import React, { useState, useEffect } from 'react';
import { Printer, X, FileText, CheckCircle2, Layers, Download, Loader2, Copy } from 'lucide-react';
import { ResumoAuditoriaNFe, NFeParsed } from '../types/fiscal';
import { generatePdfFromElement } from '../utils/pdfGenerator';

interface PrintableCalculationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  auditoria: ResumoAuditoriaNFe | null;
  nfeParsed: NFeParsed | null;
  initialMode?: 'SIMPLIFICADO' | 'ANALITICO';
}

export const PrintableCalculationSheet: React.FC<PrintableCalculationSheetProps> = ({
  isOpen,
  onClose,
  auditoria,
  nfeParsed,
  initialMode = 'SIMPLIFICADO',
}) => {
  const [mode, setMode] = useState<'SIMPLIFICADO' | 'ANALITICO'>(initialMode);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  const formatBRL = (val: any) => {
    const num = Number(val);
    const validNum = Number.isFinite(num) ? num : 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(validNum).replace(/\s/g, '\u00A0');
  };

  if (!isOpen || !auditoria || !nfeParsed) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const emitenteNome = nfeParsed.emitente.xFant || nfeParsed.emitente.xNome || 'Fornecedor';
    const regimeTexto = nfeParsed.emitente.crt === '1'
      ? 'Simples Nacional'
      : nfeParsed.emitente.crt === '2'
      ? 'Simples Nacional (Excesso de Sublimite)'
      : 'Regime Normal (RPA)';
    const totalProd = nfeParsed.totaisXML.vProd || auditoria.itensAuditados.reduce((acc, it) => acc + it.item.vProd, 0);
    const totalNF = nfeParsed.totaisXML.vNF;
    const icmsST = auditoria.totalARecolher;
    const custoReal = totalNF + icmsST;

    const textToCopy = `${emitenteNome}\n🏢 *Regime:* ${regimeTexto}\n\n💰 *Valor dos Produtos:* ${formatBRL(totalProd)}\n📦 *Valor Total da NF:* ${formatBRL(totalNF)}\n⚖️ *ICMS-ST a Recolher:* ${formatBRL(icmsST)}\n🏁 *CUSTO REAL DA COMPRA:* ${formatBRL(custoReal)}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  };

  const handleGeneratePdf = async () => {
    const docElement = document.getElementById('printable-document-a4-content');
    if (!docElement) {
      window.print();
      return;
    }
    try {
      setIsGeneratingPdf(true);
      const filename = `Relatorio-ICMS-ST-NFe-${auditoria.nNF}-${mode.toLowerCase()}.pdf`;
      const orientation = mode === 'ANALITICO' ? 'landscape' : 'portrait';
      const singlePage = mode === 'SIMPLIFICADO';
      await generatePdfFromElement(docElement, {
        filename,
        orientation,
        singlePage,
      });
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Somatórias consolidadas da nota (com proteção total contra null/undefined/NaN)
  const totais = nfeParsed?.totaisXML || { vProd: 0, vNF: 0, vST: 0, vBC: 0, vICMS: 0 };
  const itens = auditoria?.itensAuditados || [];

  const totalProdutos = Number(totais.vProd) || itens.reduce((acc, it) => acc + (Number(it?.item?.vProd) || 0), 0) || 0;
  const totalBaseST = itens.reduce((acc, it) => acc + (Number(it?.baseST) || 0), 0) || 0;
  const totalDebitoST = itens.reduce((acc, it) => acc + (Number(it?.memoriaCalculo?.debitoSTBruto) || 0), 0) || 0;
  const totalCreditoProprio = itens.reduce((acc, it) => acc + (Number(it?.memoriaCalculo?.icmsProprioDeduzivel) || 0), 0) || 0;
  const totalSTRecolher = Number(auditoria?.totalARecolher) || 0;
  const totalVNF = Number(totais.vNF) || totalProdutos;
  const totalCustoCompra = totalVNF + totalSTRecolher;

  // Estatísticas de Origem
  const itensImportados = itens.filter((it) => ['1', '2', '3', '8'].includes(String(it?.item?.origem || '')));
  const itensNacionais = itens.filter((it) => !['1', '2', '3', '8'].includes(String(it?.item?.origem || '')));

  // Totais por grupo
  const vProdImportados = itensImportados.reduce((acc, it) => acc + (Number(it?.item?.vProd) || 0), 0);
  const baseSTImportados = itensImportados.reduce((acc, it) => acc + (Number(it?.baseST) || 0), 0);
  const debitoSTImportados = itensImportados.reduce((acc, it) => acc + (Number(it?.memoriaCalculo?.debitoSTBruto) || 0), 0);
  const creditoImportados = itensImportados.reduce((acc, it) => acc + (Number(it?.memoriaCalculo?.icmsProprioDeduzivel) || 0), 0);
  const stImportados = itensImportados.reduce((acc, it) => acc + (Number(it?.totalRecolher) || 0), 0);

  const vProdNacionais = itensNacionais.reduce((acc, it) => acc + (Number(it?.item?.vProd) || 0), 0);
  const baseSTNacionais = itensNacionais.reduce((acc, it) => acc + (Number(it?.baseST) || 0), 0);
  const debitoSTNacionais = itensNacionais.reduce((acc, it) => acc + (Number(it?.memoriaCalculo?.debitoSTBruto) || 0), 0);
  const creditoNacionais = itensNacionais.reduce((acc, it) => acc + (Number(it?.memoriaCalculo?.icmsProprioDeduzivel) || 0), 0);
  const stNacionais = itensNacionais.reduce((acc, it) => acc + (Number(it?.totalRecolher) || 0), 0);

  return (
    <div className="printable-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Container Principal */}
      <div className={`printable-modal-card bg-white border border-slate-200 rounded-2xl w-full ${mode === 'ANALITICO' ? 'max-w-7xl' : 'max-w-5xl'} max-h-[96vh] overflow-y-auto shadow-xl flex flex-col transition-all duration-300`}>
        
        {/* Barra Superior de Ações com Seletor de Modo (Oculta na Impressão) */}
        <div className="p-4 border-b border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#16A34A]" />
              <h3 className="text-sm font-bold text-[#1F2937]">
                Relatório de ICMS-ST para a NF-e {auditoria.nNF}
              </h3>
            </div>

            {/* SELETOR: SIMPLIFICADO vs ANALÍTICO */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('SIMPLIFICADO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'SIMPLIFICADO'
                    ? 'bg-[#16A34A] text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-[#1F2937]'
                }`}
              >
                <span>📄 1. Simplificado (1 Folha)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('ANALITICO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'ANALITICO'
                    ? 'bg-[#16A34A] text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-[#1F2937]'
                }`}
              >
                <span>📊 2. Analítico (Item a Item)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] active:bg-[#166534] text-white font-black text-xs transition-all shadow-md shadow-green-500/20 cursor-pointer disabled:opacity-50"
              title="Gerar e baixar arquivo PDF formatado no padrão A4 oficial"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>GERANDO PDF A4...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>GERAR PDF (DOWNLOAD)</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
              title="Copiar resumo formatado para o WhatsApp"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  <span className="text-[#16A34A]">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-[#16A34A]" />
                  <span>Copiar Resumo</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Abrir diálogo de impressão do navegador (Ctrl+P)"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO DOCUMENTO A4 (Estrutura Fiel à Imagem Anexada pelo Usuário)      */}
        {/* ========================================================================= */}
        <div id="printable-document-a4-content" className={`printable-document-a4 ${mode === 'SIMPLIFICADO' ? 'p-3 sm:p-4 space-y-1.5' : 'p-4 sm:p-6 space-y-2'} bg-white text-black font-sans text-[9px] ${mode === 'ANALITICO' ? 'landscape-document' : ''}`}>
          
          {/* 1. Cabeçalho do Relatório (Idêntico ao Anexo) */}
          <div className="border-b-2 border-black pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 avoid-break">
            <div>
              <div className="text-[7.5px] font-bold text-gray-800 uppercase tracking-wider">
                SISTEMA ESPECIALISTA EM AUTOPEÇAS · CONVÊNIO ICMS 142/2018
              </div>
              <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase text-black">
                RELATÓRIO DE CÁLCULO DE ICMS-ST — ANEXO DA NOTA FISCAL
              </h1>
              <p className="text-[7px] text-gray-600 font-medium">
                {mode === 'SIMPLIFICADO'
                  ? 'Demonstrativo Sintético Consolidado para Auditoria de Compras e Homologação da Guia (1 Folha)'
                  : 'Demonstrativo Detalhado Item a Item para Auditoria de Compras e Conferência de Entrada'}
              </p>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs sm:text-sm font-black text-black">
                NF-e Nº {auditoria.nNF} · SÉRIE {auditoria.serie}
              </div>
              <div className="text-[7.5px] text-gray-700">
                Emissão: <strong>{auditoria.dataEmissao}</strong>
              </div>
            </div>
          </div>

          {/* 2. Dados dos Participantes (Fornecedor / Destinatário) */}
          <div className="grid grid-cols-2 gap-2 border border-gray-400 p-1.5 rounded bg-gray-50 text-[8px] avoid-break">
            <div className="min-w-0">
              <span className="font-bold block text-gray-900 uppercase text-[7px]">FORNECEDOR / EMITENTE ({auditoria.ufOrigem}):</span>
              <div className="font-bold text-black uppercase truncate">{nfeParsed.emitente.xNome}</div>
              <div className="font-mono text-gray-700 text-[7px] truncate">
                CNPJ: {nfeParsed.emitente.cnpj} · Regime: {nfeParsed.emitente.crtDescricao}
              </div>
            </div>
            <div className="min-w-0">
              <span className="font-bold block text-gray-900 uppercase text-[7px]">DESTINATÁRIO / COMPRADOR ({auditoria.ufDestino}):</span>
              <div className="font-bold text-black uppercase truncate">{nfeParsed.destinatario.xNome}</div>
              <div className="font-mono text-gray-700 text-[7px] truncate">
                CNPJ: {nfeParsed.destinatario.cnpj} · Alíquota Interna PR: <strong>19,50%</strong>
              </div>
            </div>
          </div>

          {/* 3. RESUMO FINANCEIRO CONSOLIDADO DA OPERAÇÃO (Os 5 Cards com Destaque Âmbar) */}
          <div className="border border-black p-1.5 rounded bg-white space-y-1 avoid-break">
            <div className="font-bold uppercase tracking-wider text-[7.5px] border-b border-black pb-0.5 flex justify-between items-center">
              <span>RESUMO FINANCEIRO CONSOLIDADO DA OPERAÇÃO</span>
              <span className="font-mono text-[7px] text-gray-700 whitespace-nowrap">
                {itensImportados.length} IMP (104,86%) · {itensNacionais.length} NAC (87,78%)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 pt-0.5 font-mono">
              <div className="p-1 bg-gray-100 rounded border border-gray-300 min-w-0">
                <span className="text-[6.5px] text-gray-600 block font-sans truncate">1. Prod (NF):</span>
                <span className="font-bold text-black text-[8px] block whitespace-nowrap">{formatBRL(totalProdutos)}</span>
              </div>

              <div className="p-1 bg-gray-100 rounded border border-gray-300 min-w-0">
                <span className="text-[6.5px] text-gray-600 block font-sans truncate">2. Base ICMS-ST:</span>
                <span className="font-bold text-black text-[8px] block whitespace-nowrap">{formatBRL(totalBaseST)}</span>
              </div>

              <div className="p-1 bg-gray-100 rounded border border-gray-300 min-w-0">
                <span className="text-[6.5px] text-gray-600 block font-sans truncate">3. Crédito Próprio:</span>
                <span className="font-bold text-black text-[8px] block whitespace-nowrap">{formatBRL(totalCreditoProprio)}</span>
              </div>

              <div className="p-1 bg-amber-50 rounded border-2 border-amber-500 min-w-0 col-span-2 sm:col-span-1">
                <span className="text-[6.5px] text-amber-900 block font-bold font-sans truncate">4. ST A PAGAR:</span>
                <span className="font-black text-black text-[8.5px] block whitespace-nowrap">{formatBRL(totalSTRecolher)}</span>
              </div>

              <div className="p-1 bg-gray-100 rounded border border-gray-300 min-w-0 col-span-2 sm:col-span-1">
                <span className="text-[6.5px] text-gray-600 block font-sans truncate">5. Custo Real:</span>
                <span className="font-bold text-black text-[8px] block whitespace-nowrap">{formatBRL(totalCustoCompra)}</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODO 1: SIMPLIFICADO (SINTÉTICO EM 1 PÁGINA A4)                          */}
          {/* ========================================================================= */}
          {mode === 'SIMPLIFICADO' && (
            <div className="space-y-1.5 pt-0.5 avoid-break">
              {/* Tabela Sintética por Alíquota & MVA */}
              <div className="space-y-0.5">
                <div className="font-bold uppercase text-[7.5px] border-b border-black pb-0.5 flex justify-between">
                  <span>COMPOSIÇÃO FISCAL POR ORIGEM & MVA (QUADRO SINTÉTICO)</span>
                  <span className="font-mono text-gray-600 text-[7px]">{auditoria.itensAuditados.length} ITENS TOTAIS</span>
                </div>

                <table className="w-full text-left text-[7.5px] border-collapse border border-gray-400 table-fixed">
                  <colgroup>
                    <col style={{ width: '28%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '22%' }} />
                  </colgroup>
                  <thead className="bg-gray-200 text-black font-bold uppercase text-[6.5px]">
                    <tr className="border-b border-gray-400">
                      <th className="py-0.5 px-1.5 border-r border-gray-400 truncate">Grupo de Mercadorias</th>
                      <th className="py-0.5 px-1 border-r border-gray-400 text-center whitespace-nowrap">Qtd</th>
                      <th className="py-0.5 px-1 border-r border-gray-400 text-center whitespace-nowrap">Alíq.</th>
                      <th className="py-0.5 px-1.5 border-r border-gray-400 text-right whitespace-nowrap">MVA</th>
                      <th className="py-0.5 px-1.5 border-r border-gray-400 text-right whitespace-nowrap">Base Cálculo ST</th>
                      <th className="py-0.5 px-1.5 text-right font-black whitespace-nowrap">ICMS-ST a Pagar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 font-mono text-[7.5px]">
                    <tr className="hover:bg-gray-50">
                      <td className="py-0.5 px-1.5 border-r border-gray-300 font-sans font-bold text-[7px]">
                        Peças Nacionais (Origem 0, 4, 5)
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-300 text-center whitespace-nowrap">{itensNacionais.length}</td>
                      <td className="py-0.5 px-1 border-r border-gray-300 text-center whitespace-nowrap">12%</td>
                      <td className="py-0.5 px-1.5 border-r border-gray-300 text-right font-bold whitespace-nowrap">87,78%</td>
                      <td className="py-0.5 px-1.5 border-r border-gray-300 text-right whitespace-nowrap">{formatBRL(baseSTNacionais)}</td>
                      <td className="py-0.5 px-1.5 text-right font-black whitespace-nowrap">{formatBRL(stNacionais)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-0.5 px-1.5 border-r border-gray-300 font-sans font-bold text-[7px]">
                        Peças Importadas (Origem 1, 2, 3, 8)
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-300 text-center whitespace-nowrap">{itensImportados.length}</td>
                      <td className="py-0.5 px-1 border-r border-gray-300 text-center whitespace-nowrap">4%</td>
                      <td className="py-0.5 px-1.5 border-r border-gray-300 text-right font-bold whitespace-nowrap">104,86%</td>
                      <td className="py-0.5 px-1.5 border-r border-gray-300 text-right whitespace-nowrap">{formatBRL(baseSTImportados)}</td>
                      <td className="py-0.5 px-1.5 text-right font-black whitespace-nowrap">{formatBRL(stImportados)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold border-t-2 border-black font-mono text-[7.5px]">
                    <tr>
                      <td className="py-0.5 px-1.5 border-r border-gray-400 uppercase font-sans text-[7px]">TOTAL CONSOLIDADO:</td>
                      <td className="py-0.5 px-1 border-r border-gray-400 text-center whitespace-nowrap">{auditoria.itensAuditados.length}</td>
                      <td className="py-0.5 px-1 border-r border-gray-400 text-center whitespace-nowrap">—</td>
                      <td className="py-0.5 px-1.5 border-r border-gray-400 text-center whitespace-nowrap">—</td>
                      <td className="py-0.5 px-1.5 border-r border-gray-400 text-right whitespace-nowrap">{formatBRL(totalBaseST)}</td>
                      <td className="py-0.5 px-1.5 text-right font-black bg-amber-100 whitespace-nowrap">{formatBRL(totalSTRecolher)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Informações para Homologação e Pagamento da Guia */}
              <div className="border border-gray-400 p-1.5 rounded bg-gray-50 text-[7.5px] space-y-1">
                <div className="font-bold text-gray-900 uppercase text-[7px] border-b border-gray-300 pb-0.5">
                  DADOS PARA PAGAMENTO DA GUIA (SETOR FINANCEIRO / FISCAL):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 font-mono text-[7px]">
                  <div className="min-w-0 bg-white p-1 rounded border border-gray-300">
                    <span className="text-gray-600 block font-sans text-[6px]">ESTADO FAVORECIDO:</span>
                    <strong className="text-black block truncate">PARANÁ (SEFAZ/PR)</strong>
                  </div>
                  <div className="min-w-0 bg-white p-1 rounded border border-gray-300">
                    <span className="text-gray-600 block font-sans text-[6px]">CÓDIGO DE RECEITA:</span>
                    <strong className="block whitespace-nowrap">10009-9 (ICMS-ST)</strong>
                  </div>
                  <div className="min-w-0 bg-white p-1 rounded border border-gray-300">
                    <span className="text-gray-600 block font-sans text-[6px]">ALÍQUOTA INTERNA PR:</span>
                    <strong className="block whitespace-nowrap">19,50% (Lei 21.850)</strong>
                  </div>
                  <div className="min-w-0 bg-white p-1 rounded border border-gray-300">
                    <span className="text-gray-600 block font-sans text-[6px]">TOTAL DA NOTA FISCAL:</span>
                    <strong className="block whitespace-nowrap">{formatBRL(nfeParsed.totaisXML.vNF)}</strong>
                  </div>
                  <div className="min-w-0 bg-white p-1 rounded border border-gray-300">
                    <span className="text-gray-600 block font-sans text-[6px]">TOTAL CRÉDITO PRÓPRIO:</span>
                    <strong className="block whitespace-nowrap">{formatBRL(totalCreditoProprio)}</strong>
                  </div>
                  <div className="min-w-0 bg-amber-50 p-1 rounded border border-amber-400">
                    <span className="text-gray-600 block font-sans text-[6px] text-amber-900 font-bold">TOTAL GUIA A RECOLHER:</span>
                    <strong className="text-black font-black text-[8px] block whitespace-nowrap">
                      {formatBRL(totalSTRecolher)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Base Legal */}
              <div className="border border-gray-300 p-1 rounded bg-white text-[7px] space-y-0.5">
                <div className="font-bold text-gray-900 uppercase">Regras Tributárias Oficiais:</div>
                <div className="font-mono text-gray-700 leading-tight">
                  • <strong>Convênio ICMS 142/2018 & Protocolo ICMS 41/2008</strong>: MVA Original de 71,78% ajustada conforme alíquota interestadual e interna de 19,50% do Paraná.<br />
                  • <strong>Fórmula</strong>: MVA Ajustada = [((1 + 0,7178) × (1 - ALIQ_INTER)) ÷ (1 - 0,195)] - 1 ➔ 104,86% (4%) e 87,78% (12%).
                </div>
              </div>

              {/* Campos de Assinatura */}
              <div className="pt-1.5 border-t border-gray-400 grid grid-cols-2 gap-6 text-[7.5px] text-center font-sans">
                <div>
                  <div className="border-b border-black pb-2.5 mb-0.5"></div>
                  <span className="font-bold text-gray-800">Conferência Comprador / Recebimento da NF-e</span>
                </div>
                <div>
                  <div className="border-b border-black pb-2.5 mb-0.5"></div>
                  <span className="font-bold text-gray-800">Setor Fiscal / Liberação Financeira para Pagamento da Guia</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODO 2: ANALÍTICO (ITEM A ITEM COMPLETO)                                  */}
          {/* ========================================================================= */}
          {mode === 'ANALITICO' && (
            <div className="space-y-1">
              <div className="font-bold uppercase text-[8px] border-b border-black pb-0.5 flex justify-between items-center">
                <span>MEMÓRIA DE CÁLCULO ITEM A ITEM (VAI JUNTO COM A NOTA)</span>
                <span className="font-mono text-gray-600 text-[7.5px]">{auditoria.itensAuditados.length} ITENS</span>
              </div>

              <table className="w-full text-left text-[7.5px] border-collapse border border-gray-400 table-fixed">
                <colgroup>
                  <col style={{ width: '4%' }} />
                  <col style={{ width: '31%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>
                <thead className="bg-gray-200 text-black font-bold uppercase text-[7px]">
                  <tr className="border-b border-gray-400">
                    <th className="py-1.5 px-1 border-r border-gray-400 text-center whitespace-nowrap">#</th>
                    <th className="py-1.5 px-1.5 border-r border-gray-400">Descrição da Peça / Cód / NCM</th>
                    <th className="py-1.5 px-1 border-r border-gray-400 text-center whitespace-nowrap">Qtd</th>
                    <th className="py-1.5 px-1.5 border-r border-gray-400 text-right whitespace-nowrap">Total NF</th>
                    <th className="py-1.5 px-1 border-r border-gray-400 text-right whitespace-nowrap">MVA</th>
                    <th className="py-1.5 px-1.5 border-r border-gray-400 text-right whitespace-nowrap">Base ST</th>
                    <th className="py-1.5 px-1.5 border-r border-gray-400 text-right font-black bg-amber-100/50 whitespace-nowrap">ST a Pagar</th>
                    <th className="py-1.5 px-1.5 text-right font-black whitespace-nowrap">Custo Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 font-mono text-[7px]">
                  {auditoria.itensAuditados.map((it) => {
                    const isImportado = ['1', '2', '3', '8'].includes(it.item.origem);
                    const custoRealItem = it.item.vProd + it.totalRecolher;

                    return (
                      <tr key={it.item.nItem} className="hover:bg-gray-50 avoid-break">
                        <td className="py-1.5 px-1 border-r border-gray-300 text-center font-bold whitespace-nowrap">#{it.item.nItem}</td>
                        <td className="py-1.5 px-1.5 border-r border-gray-300 font-sans">
                          <div className="font-bold text-black">{it.item.xProd}</div>
                          <div className="text-[6.5px] text-gray-600 font-mono whitespace-nowrap">
                            Cód: {it.item.cProd} · NCM: {it.item.ncm} · {isImportado ? 'Imp (4%)' : 'Nac (12%)'}
                          </div>
                        </td>
                        <td className="py-1.5 px-1 border-r border-gray-300 text-center whitespace-nowrap">{it.item.qCom} {it.item.uCom}</td>
                        <td className="py-1.5 px-1.5 border-r border-gray-300 text-right whitespace-nowrap">{formatBRL(it.item.vProd)}</td>
                        <td className="py-1.5 px-1 border-r border-gray-300 text-right font-bold whitespace-nowrap">{it.mva.toFixed(2)}%</td>
                        <td className="py-1.5 px-1.5 border-r border-gray-300 text-right whitespace-nowrap">{formatBRL(it.baseST)}</td>
                        <td className="py-1.5 px-1.5 border-r border-gray-300 text-right font-black bg-amber-50 whitespace-nowrap">
                          {formatBRL(it.totalRecolher)}
                        </td>
                        <td className="py-1.5 px-1.5 text-right font-black whitespace-nowrap">{formatBRL(custoRealItem)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100 font-bold border-t-2 border-black font-mono text-[7.5px]">
                  <tr>
                    <td colSpan={3} className="py-1.5 px-1.5 border-r border-gray-400 text-right uppercase font-sans">
                      TOTAIS CONSOLIDADOS:
                    </td>
                    <td className="py-1.5 px-1.5 border-r border-gray-400 text-right whitespace-nowrap">{formatBRL(totalProdutos)}</td>
                    <td className="py-1.5 px-1 border-r border-gray-400 text-center whitespace-nowrap">—</td>
                    <td className="py-1.5 px-1.5 border-r border-gray-400 text-right whitespace-nowrap">{formatBRL(totalBaseST)}</td>
                    <td className="py-1.5 px-1.5 border-r border-gray-400 text-right font-black bg-amber-100 whitespace-nowrap">
                      {formatBRL(totalSTRecolher)}
                    </td>
                    <td className="py-1.5 px-1.5 text-right font-black whitespace-nowrap">{formatBRL(totalCustoCompra)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Assinaturas no Rodapé Analítico */}
              <div className="pt-2 border-t border-gray-400 grid grid-cols-2 gap-6 text-[8px] text-center font-sans avoid-break">
                <div>
                  <div className="border-b border-black pb-4 mb-0.5"></div>
                  <span className="font-bold text-gray-800">Conferência Comprador / Recebimento NF-e</span>
                </div>
                <div>
                  <div className="border-b border-black pb-4 mb-0.5"></div>
                  <span className="font-bold text-gray-800">Setor Fiscal / Liberação para Pagamento da Guia</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
