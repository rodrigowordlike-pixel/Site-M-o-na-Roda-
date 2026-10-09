import React, { useState } from 'react';
import { X, Printer, Receipt, Download, Loader2 } from 'lucide-react';
import { NFeParsed, ResumoAuditoriaNFe } from '../types/fiscal';
import { generatePdfFromElement } from '../utils/pdfGenerator';

interface FiscalBorderoModalProps {
  isOpen: boolean;
  onClose: () => void;
  nfeParsed: NFeParsed | null;
  auditoria: ResumoAuditoriaNFe | null;
}

export const FiscalBorderoModal: React.FC<FiscalBorderoModalProps> = ({
  isOpen,
  onClose,
  nfeParsed,
  auditoria,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !nfeParsed || !auditoria) return null;

  const formatBRL = (val: any) => {
    const num = Number(val);
    const validNum = Number.isFinite(num) ? num : 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(validNum);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = async () => {
    const docElement = document.getElementById('fiscal-bordero-document-content');
    if (!docElement) {
      window.print();
      return;
    }
    try {
      setIsGeneratingPdf(true);
      const filename = `Bordero-ST-NFe-${auditoria.nNF}.pdf`;
      await generatePdfFromElement(docElement, {
        filename,
        orientation: 'portrait',
      });
    } catch (err) {
      console.error('Erro ao gerar PDF do Borderô:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const totalST = auditoria.totalARecolher;
  const totalProdutos = nfeParsed.totaisXML.vProd;

  return (
    <div className="printable-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="printable-modal-card bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[96vh] overflow-y-auto shadow-xl flex flex-col">
        
        {/* Barra de Ações Superior (Oculta na Impressão) */}
        <div className="p-4 border-b border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#16A34A]" />
            <h3 className="text-sm font-bold text-[#1F2937]">
              Borderô Fiscal de Recolhimento de ICMS-ST (NF-e Nº {auditoria.nNF})
            </h3>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] active:bg-[#166534] text-white font-black text-xs transition-all shadow-md shadow-green-500/20 cursor-pointer disabled:opacity-50"
              title="Baixar Borderô em arquivo PDF oficial A4"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>GERANDO PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>GERAR PDF (DOWNLOAD)</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
              title="Abrir impressão do sistema"
            >
              <Printer className="h-4 w-4 text-[#16A34A]" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1F2937] transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO BORDERÔ (Direto, Sintético e Perfeito para o Financeiro) */}
        {/* ========================================================================= */}
        <div id="fiscal-bordero-document-content" className="printable-document-a4 p-4 sm:p-6 bg-white text-black font-sans text-[8.5px] space-y-2">
          
          {/* Cabeçalho do Borderô */}
          <div className="border-b-2 border-black pb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 avoid-break">
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase text-black">
                BORDERÔ DE RECOLHIMENTO — ICMS SUBSTITUIÇÃO TRIBUTÁRIA
              </h1>
              <p className="text-[7.5px] text-gray-700 font-medium">
                Documento de Homologação para Liberação de Pagamento de Guia (GNRE / DARE)
              </p>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs font-black text-black">
                NF-e Nº {auditoria.nNF} · SÉRIE {auditoria.serie}
              </div>
              <div className="text-[8px] text-gray-600">
                Emissão: {auditoria.dataEmissao}
              </div>
            </div>
          </div>

          {/* Dados de Pagamento da Guia */}
          <div className="grid grid-cols-2 gap-2 border border-gray-400 p-2 rounded bg-gray-50 text-[8.5px] avoid-break">
            <div>
              <span className="text-gray-600 block text-[7.5px]">FAVORECIDO / ESTADO:</span>
              <span className="font-black text-black">ESTADO DO PARANÁ (SEFAZ/PR)</span>
              <div className="text-[7.5px] text-gray-700 mt-0.5">Alíquota Interna Aplicada: <strong>19,50%</strong></div>
            </div>
            <div>
              <span className="text-gray-600 block text-[7.5px]">OBRIGAÇÃO FISCAL:</span>
              <span className="font-bold text-black">ICMS-ST Antecipação Entrada (Prot. 41/08)</span>
              <div className="text-[7.5px] text-gray-700 mt-0.5">Fornecedor: <strong>{nfeParsed.emitente.xNome}</strong> ({nfeParsed.emitente.uf})</div>
            </div>
            <div className="col-span-2 pt-0.5 border-t border-gray-300 flex justify-between font-mono text-[7.5px]">
              <span>Chave: {auditoria.chaveAcesso}</span>
              <span>Total de Itens: {auditoria.itensAuditados.length}</span>
            </div>
          </div>

          {/* DESTAQUE DO VALOR DA GUIA */}
          <div className="p-2 bg-gray-100 border-2 border-black rounded flex items-center justify-between avoid-break">
            <div>
              <span className="text-[8.5px] font-bold uppercase block text-gray-700">VALOR TOTAL DA GUIA A PAGAR (ST):</span>
              <span className="text-[7.5px] text-gray-600">Total dos Produtos na NF: {formatBRL(totalProdutos)}</span>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-black">
              {formatBRL(totalST)}
            </div>
          </div>

          {/* LISTA SINTÉTICA DE PRODUTOS & ST (BORDERÔ DIRETO) */}
          <div className="space-y-0.5">
            <div className="font-bold uppercase text-[8px] border-b border-black pb-0.5 flex justify-between">
              <span>DISCRIMINAÇÃO DAS PEÇAS & ICMS-ST CORRESPONDENTE</span>
              <span className="font-mono text-gray-600 text-[7.5px]">{auditoria.itensAuditados.length} ITENS</span>
            </div>

              <table className="w-full text-left text-[7.5px] border-collapse border border-gray-400 table-fixed">
                <thead className="bg-gray-200 text-black font-bold uppercase text-[7px]">
                  <tr className="border-b border-gray-400">
                    <th className="p-1 border-r border-gray-400 text-center w-[6%] whitespace-nowrap">Item</th>
                    <th className="p-1 border-r border-gray-400 w-[14%] whitespace-nowrap">Código</th>
                    <th className="p-1 border-r border-gray-400 w-[42%]">Descrição do Produto</th>
                    <th className="p-1 border-r border-gray-400 text-center w-[8%] whitespace-nowrap">Qtd</th>
                    <th className="p-1 border-r border-gray-400 text-right w-[12%] whitespace-nowrap">Preço NF</th>
                    <th className="p-1 border-r border-gray-400 text-right w-[8%] whitespace-nowrap">MVA</th>
                    <th className="p-1 text-right font-black w-[10%] whitespace-nowrap">ST a Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 font-mono text-[7px]">
                  {auditoria.itensAuditados.map((it) => (
                    <tr key={it.item.nItem} className="hover:bg-gray-50 avoid-break">
                      <td className="p-1 border-r border-gray-300 text-center font-bold whitespace-nowrap">#{it.item.nItem}</td>
                      <td className="p-1 border-r border-gray-300 font-sans truncate">{it.item.cProd}</td>
                      <td className="p-1 border-r border-gray-300 font-sans font-medium truncate">{it.item.xProd}</td>
                      <td className="p-1 border-r border-gray-300 text-center whitespace-nowrap">{it.item.qCom}</td>
                      <td className="p-1 border-r border-gray-300 text-right whitespace-nowrap">{formatBRL(it.item.vProd)}</td>
                      <td className="p-1 border-r border-gray-300 text-right text-gray-700 whitespace-nowrap">{it.mva.toFixed(2)}%</td>
                      <td className="p-1 text-right font-black text-black bg-amber-50/50 whitespace-nowrap">{formatBRL(it.totalRecolher)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold border-t-2 border-black text-[7.5px] font-mono">
                  <tr>
                    <td colSpan={4} className="p-1 border-r border-gray-400 text-right uppercase font-sans">
                      TOTAL DA GUIA:
                    </td>
                    <td className="p-1 border-r border-gray-400 text-right whitespace-nowrap">{formatBRL(totalProdutos)}</td>
                    <td className="p-1 border-r border-gray-400 text-center whitespace-nowrap">—</td>
                    <td className="p-1 text-right font-black text-black bg-amber-100 whitespace-nowrap">{formatBRL(totalST)}</td>
                  </tr>
                </tfoot>
              </table>
          </div>

          {/* Assinatura / Homologação */}
          <div className="pt-2 border-t border-gray-400 grid grid-cols-2 gap-6 text-[8px] text-center font-sans avoid-break">
            <div>
              <div className="border-b border-black pb-4 mb-0.5"></div>
              <span className="font-bold text-gray-800">Conferência Fiscal / Responsável Técnico</span>
            </div>
            <div>
              <div className="border-b border-black pb-4 mb-0.5"></div>
              <span className="font-bold text-gray-800">Autorização Financeira de Pagamento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
