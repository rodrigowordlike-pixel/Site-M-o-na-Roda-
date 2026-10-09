import React, { useState } from 'react';
import { X, Printer, Download, FileText, Loader2 } from 'lucide-react';
import { NFeParsed, ResumoAuditoriaNFe } from '../types/fiscal';
import { generatePdfFromElement } from '../utils/pdfGenerator';

interface DanfeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nfeParsed: NFeParsed | null;
  auditoria: ResumoAuditoriaNFe | null;
  rawXml?: string;
}

export const DanfeModal: React.FC<DanfeModalProps> = ({
  isOpen,
  onClose,
  nfeParsed,
  auditoria,
  rawXml,
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

  const handleDownloadXml = () => {
    const xmlContent =
      rawXml ||
      `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe${auditoria.chaveAcesso}"><ide><nNF>${auditoria.nNF}</nNF><serie>${auditoria.serie}</serie><dhEmi>${auditoria.dataEmissao}</dhEmi></ide></infNFe></NFe></nfeProc>`;
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFe-${auditoria.chaveAcesso || auditoria.nNF}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = async () => {
    const docElement = document.getElementById('danfe-document-content');
    if (!docElement) {
      window.print();
      return;
    }
    try {
      setIsGeneratingPdf(true);
      const filename = `DANFE-NFe-${auditoria.nNF}.pdf`;
      await generatePdfFromElement(docElement, {
        filename,
        orientation: 'portrait',
      });
    } catch (err) {
      console.error('Erro ao gerar PDF do DANFE:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Formatação da Chave de Acesso em grupos de 4 dígitos
  const chaveFormatada = auditoria.chaveAcesso
    ? auditoria.chaveAcesso.replace(/(\d{4})/g, '$1 ').trim()
    : '4126 1000 0000 0000 0000 5500 1000 0000 0000 0000 0000';

  const protocoloAutorizacao = `14126${auditoria.nNF.padStart(9, '0')} · ${auditoria.dataEmissao} 10:15:32`;

  return (
    <div className="printable-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="printable-modal-card bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[96vh] overflow-y-auto shadow-xl flex flex-col">
        
        {/* Barra de Ações Superior (Oculta na Impressão) */}
        <div className="p-4 border-b border-slate-200 bg-[#F8FAFC] flex items-center justify-between no-print sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#16A34A]" />
            <h3 className="text-sm font-bold text-[#1F2937]">
              Visualização Oficial do DANFE (NF-e Nº {auditoria.nNF})
            </h3>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] active:bg-[#166534] text-white font-black text-xs transition-all shadow-md shadow-green-500/20 cursor-pointer disabled:opacity-50"
              title="Baixar espelho do DANFE em PDF oficial A4"
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
              onClick={handleDownloadXml}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
              title="Baixar arquivo XML da NF-e"
            >
              <Download className="h-4 w-4 text-sky-600" />
              <span>Baixar XML</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
              title="Abrir diálogo de impressão (Ctrl+P)"
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
        {/* CORPO DO DANFE PADRÃO OFICIAL BRASILEIRO (Folha A4 Fundo Branco)          */}
        {/* ========================================================================= */}
        <div id="danfe-document-content" className="printable-document-a4 p-4 sm:p-6 bg-white text-black font-sans text-[8.5px] space-y-1">
          
          {/* 1. CANHOTO DE RECEBIMENTO */}
          <div className="border border-black p-1 text-[7.5px] leading-tight avoid-break">
            <div className="grid grid-cols-12 gap-1">
              <div className="col-span-10 border-r border-black pr-1">
                RECEBEMOS DE <span className="font-bold">{nfeParsed.emitente.xNome}</span> OS PRODUTOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO. DESTINATÁRIO: {nfeParsed.destinatario.xNome}
              </div>
              <div className="col-span-2 text-center font-bold font-mono">
                <div className="text-[8.5px]">NF-e</div>
                <div>Nº {auditoria.nNF}</div>
                <div>SÉRIE {auditoria.serie}</div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-1 border-t border-black mt-1 pt-0.5">
              <div className="col-span-3 border-r border-black pr-1">
                <span className="text-[6.5px] block text-gray-700">DATA DE RECEBIMENTO</span>
                <div className="h-3"></div>
              </div>
              <div className="col-span-9">
                <span className="text-[6.5px] block text-gray-700">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
                <div className="h-3"></div>
              </div>
            </div>
          </div>

          {/* LINHA PONTILHADA DE DESTAQUE DO CANHOTO */}
          <div className="border-b border-dashed border-gray-400 my-0.5 avoid-break"></div>

          {/* 2. CABEÇALHO PRINCIPAL DO DANFE */}
          <div className="border-2 border-black grid grid-cols-12 gap-0 avoid-break">
            {/* Bloco 1: Emitente */}
            <div className="col-span-5 p-1.5 border-r-2 border-black flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-black uppercase text-black tracking-tight">{nfeParsed.emitente.xNome}</div>
                <div className="text-[7.5px] text-gray-700 mt-0.5 leading-tight">
                  AV. INDUSTRIAL AUTOMOTIVA, 1500 · DISTRITO INDUSTRIAL<br />
                  CEP: 80000-000 · {nfeParsed.emitente.xMun || 'CURITIBA'} - {nfeParsed.emitente.uf} · FONE: (41) 3300-0000
                </div>
              </div>
              <div className="mt-1 text-[7.5px] border-t border-gray-300 pt-0.5 font-mono">
                <div>CNPJ: <strong>{nfeParsed.emitente.cnpj}</strong></div>
                <div>INSCRIÇÃO ESTADUAL: <strong>{nfeParsed.emitente.ie || 'Isento'}</strong></div>
                <div>REGIME TRIBUTÁRIO: <strong>{nfeParsed.emitente.crtDescricao}</strong></div>
              </div>
            </div>

            {/* Bloco 2: Identificação DANFE */}
            <div className="col-span-3 p-1.5 border-r-2 border-black text-center flex flex-col justify-between">
              <div>
                <div className="text-sm font-black tracking-widest leading-none">DANFE</div>
                <div className="text-[6.5px] text-gray-700 uppercase font-semibold leading-tight mt-0.5">
                  Documento Auxiliar da Nota Fiscal Eletrônica
                </div>
              </div>

              <div className="my-0.5 py-0.5 border-y border-black font-mono">
                <div className="text-[7.5px] font-bold">0 - ENTRADA / 1 - SAÍDA</div>
                <div className="text-[10px] font-black bg-gray-200 inline-block px-1.5 rounded mt-0.5">1</div>
              </div>

              <div className="font-mono">
                <div className="text-[10px] font-black">Nº {auditoria.nNF}</div>
                <div className="text-[7.5px] font-bold">SÉRIE {auditoria.serie}</div>
                <div className="text-[6.5px] text-gray-600">FOLHA 1/1</div>
              </div>
            </div>

            {/* Bloco 3: Código de Barras & Chave de Acesso */}
            <div className="col-span-4 p-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-center h-7 bg-white px-1 overflow-hidden">
                  <svg className="w-full h-6" viewBox="0 0 280 36">
                    <rect x="0" y="0" width="4" height="36" fill="black" />
                    <rect x="6" y="0" width="2" height="36" fill="black" />
                    <rect x="10" y="0" width="6" height="36" fill="black" />
                    <rect x="18" y="0" width="2" height="36" fill="black" />
                    <rect x="22" y="0" width="4" height="36" fill="black" />
                    <rect x="28" y="0" width="6" height="36" fill="black" />
                    <rect x="36" y="0" width="2" height="36" fill="black" />
                    <rect x="40" y="0" width="4" height="36" fill="black" />
                    <rect x="46" y="0" width="2" height="36" fill="black" />
                    <rect x="50" y="0" width="8" height="36" fill="black" />
                    <rect x="60" y="0" width="2" height="36" fill="black" />
                    <rect x="64" y="0" width="6" height="36" fill="black" />
                    <rect x="72" y="0" width="4" height="36" fill="black" />
                    <rect x="78" y="0" width="2" height="36" fill="black" />
                    <rect x="82" y="0" width="6" height="36" fill="black" />
                    <rect x="90" y="0" width="2" height="36" fill="black" />
                    <rect x="94" y="0" width="6" height="36" fill="black" />
                    <rect x="102" y="0" width="4" height="36" fill="black" />
                    <rect x="108" y="0" width="2" height="36" fill="black" />
                    <rect x="112" y="0" width="8" height="36" fill="black" />
                    <rect x="122" y="0" width="2" height="36" fill="black" />
                    <rect x="126" y="0" width="6" height="36" fill="black" />
                    <rect x="134" y="0" width="4" height="36" fill="black" />
                    <rect x="140" y="0" width="2" height="36" fill="black" />
                    <rect x="144" y="0" width="6" height="36" fill="black" />
                    <rect x="152" y="0" width="4" height="36" fill="black" />
                    <rect x="158" y="0" width="6" height="36" fill="black" />
                    <rect x="166" y="0" width="2" height="36" fill="black" />
                    <rect x="170" y="0" width="4" height="36" fill="black" />
                    <rect x="176" y="0" width="8" height="36" fill="black" />
                    <rect x="186" y="0" width="2" height="36" fill="black" />
                    <rect x="190" y="0" width="6" height="36" fill="black" />
                    <rect x="198" y="0" width="4" height="36" fill="black" />
                    <rect x="204" y="0" width="2" height="36" fill="black" />
                    <rect x="208" y="0" width="6" height="36" fill="black" />
                    <rect x="216" y="0" width="2" height="36" fill="black" />
                    <rect x="220" y="0" width="8" height="36" fill="black" />
                    <rect x="230" y="0" width="4" height="36" fill="black" />
                    <rect x="236" y="0" width="2" height="36" fill="black" />
                    <rect x="240" y="0" width="6" height="36" fill="black" />
                    <rect x="248" y="0" width="4" height="36" fill="black" />
                    <rect x="254" y="0" width="2" height="36" fill="black" />
                    <rect x="258" y="0" width="8" height="36" fill="black" />
                    <rect x="268" y="0" width="4" height="36" fill="black" />
                    <rect x="274" y="0" width="2" height="36" fill="black" />
                  </svg>
                </div>

                <div className="mt-0.5">
                  <div className="text-[6.5px] font-bold uppercase text-gray-700">CHAVE DE ACESSO</div>
                  <div className="font-mono text-[7px] font-black tracking-tight bg-gray-100 p-0.5 border border-gray-400 rounded text-center">
                    {chaveFormatada}
                  </div>
                </div>
              </div>

              <div className="text-[6.5px] text-gray-600 mt-0.5 leading-tight border-t border-gray-200 pt-0.5">
                Consulta de autenticidade no portal nacional da NF-e <strong>www.nfe.fazenda.gov.br</strong>
              </div>
            </div>
          </div>

          {/* 3. NATUREZA DA OPERAÇÃO & PROTOCOLO */}
          <div className="border border-black grid grid-cols-12 gap-0 text-[7.5px] avoid-break">
            <div className="col-span-7 p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 block uppercase">NATUREZA DA OPERAÇÃO</span>
              <span className="font-bold text-black uppercase">{nfeParsed.natOp || 'VENDA DE MERCADORIAS (AUTOPEÇAS)'}</span>
            </div>
            <div className="col-span-5 p-1 font-mono">
              <span className="text-[6.5px] text-gray-700 block uppercase font-sans">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
              <span className="font-bold text-black">{protocoloAutorizacao}</span>
            </div>
          </div>

          {/* 4. DESTINATÁRIO / REMETENTE */}
          <div className="border border-black p-1 avoid-break">
            <div className="font-bold text-[7px] uppercase border-b border-gray-300 pb-0.5 mb-0.5 bg-gray-100 px-1">
              DESTINATÁRIO / REMETENTE
            </div>
            <div className="grid grid-cols-12 gap-1 text-[7.5px]">
              <div className="col-span-7 border-r border-gray-300 pr-1">
                <span className="text-[6.5px] text-gray-600 block">NOME / RAZÃO SOCIAL</span>
                <span className="font-bold text-black uppercase truncate block">{nfeParsed.destinatario.xNome}</span>
              </div>
              <div className="col-span-3 border-r border-gray-300 pr-1">
                <span className="text-[6.5px] text-gray-600 block">CNPJ / CPF</span>
                <span className="font-mono font-bold text-black">{nfeParsed.destinatario.cnpj}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[6.5px] text-gray-600 block">DATA DA EMISSÃO</span>
                <span className="font-mono font-bold text-black">{auditoria.dataEmissao}</span>
              </div>

              <div className="col-span-6 border-r border-gray-300 pr-1 border-t border-gray-200 pt-0.5">
                <span className="text-[6.5px] text-gray-600 block">ENDEREÇO</span>
                <span className="text-black uppercase">RODOVIA BR 277, KM 102 · DISTRITO INDUSTRIAL</span>
              </div>
              <div className="col-span-3 border-r border-gray-300 pr-1 border-t border-gray-200 pt-0.5">
                <span className="text-[6.5px] text-gray-600 block">MUNICÍPIO</span>
                <span className="text-black uppercase">{nfeParsed.destinatario.xMun || 'CURITIBA'}</span>
              </div>
              <div className="col-span-1 border-r border-gray-300 pr-1 border-t border-gray-200 pt-0.5">
                <span className="text-[6.5px] text-gray-600 block">UF</span>
                <span className="font-bold text-black">{nfeParsed.destinatario.uf}</span>
              </div>
              <div className="col-span-2 border-t border-gray-200 pt-0.5">
                <span className="text-[6.5px] text-gray-600 block">INSCRIÇÃO ESTADUAL</span>
                <span className="font-mono text-black">{nfeParsed.destinatario.ie || 'ISENTO'}</span>
              </div>
            </div>
          </div>

          {/* 5. CÁLCULO DO IMPOSTO */}
          <div className="border border-black p-1 avoid-break">
            <div className="font-bold text-[7px] uppercase border-b border-gray-300 pb-0.5 mb-0.5 bg-gray-100 px-1">
              CÁLCULO DO IMPOSTO
            </div>
            <div className="grid grid-cols-6 gap-1 text-[7.5px] font-mono">
              <div className="border-r border-gray-300 pr-1">
                <span className="text-[6.5px] text-gray-600 block font-sans">BASE CÁLC. ICMS</span>
                <span className="font-bold">{formatBRL(nfeParsed.totaisXML.vBC)}</span>
              </div>
              <div className="border-r border-gray-300 pr-1">
                <span className="text-[6.5px] text-gray-600 block font-sans">VALOR ICMS</span>
                <span className="font-bold">{formatBRL(nfeParsed.totaisXML.vICMS)}</span>
              </div>
              <div className="border-r border-gray-300 pr-1">
                <span className="text-[6.5px] text-gray-600 block font-sans">BASE ICMS ST</span>
                <span className="font-bold">{formatBRL(nfeParsed.totaisXML.vBCST)}</span>
              </div>
              <div className="border-r border-gray-300 pr-1">
                <span className="text-[6.5px] text-gray-600 block font-sans">VALOR ICMS ST</span>
                <span className="font-bold">{formatBRL(nfeParsed.totaisXML.vST)}</span>
              </div>
              <div className="border-r border-gray-300 pr-1">
                <span className="text-[6.5px] text-gray-600 block font-sans">TOTAL IPI</span>
                <span className="font-bold">{formatBRL(nfeParsed.totaisXML.vIPI)}</span>
              </div>
              <div>
                <span className="text-[6.5px] text-gray-600 block font-sans font-bold text-black">TOTAL DA NOTA</span>
                <span className="font-black text-[9.5px] text-black">{formatBRL(nfeParsed.totaisXML.vNF)}</span>
              </div>
            </div>
          </div>

          {/* 6. DADOS DOS PRODUTOS / SERVIÇOS */}
          <div className="border border-black p-0.5">
            <div className="font-bold text-[7px] uppercase border-b border-gray-300 pb-0.5 mb-0.5 bg-gray-100 px-1 flex justify-between">
              <span>DADOS DOS PRODUTOS / SERVIÇOS</span>
              <span className="font-mono text-[6.5px] text-gray-600">{nfeParsed.itens.length} ITENS</span>
            </div>
            
            <table className="w-full text-left text-[7px] border-collapse table-fixed">
              <thead className="bg-gray-100 font-bold border-b border-black">
                <tr>
                  <th className="p-0.5 border-r border-gray-300 w-[8%]">CÓDIGO</th>
                  <th className="p-0.5 border-r border-gray-300 w-[30%]">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                  <th className="p-0.5 border-r border-gray-300 w-[10%]">NCM/SH</th>
                  <th className="p-0.5 border-r border-gray-300 w-[8%]">CST</th>
                  <th className="p-0.5 border-r border-gray-300 w-[6%]">CFOP</th>
                  <th className="p-0.5 border-r border-gray-300 w-[5%]">UN</th>
                  <th className="p-0.5 border-r border-gray-300 text-right w-[6%]">QTD</th>
                  <th className="p-0.5 border-r border-gray-300 text-right w-[9%]">V. UNIT</th>
                  <th className="p-0.5 border-r border-gray-300 text-right w-[9%]">V. TOTAL</th>
                  <th className="p-0.5 text-right w-[9%]">ALÍQ ICMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {nfeParsed.itens.map((it) => (
                  <tr key={it.nItem} className="hover:bg-gray-50 avoid-break">
                    <td className="p-0.5 border-r border-gray-200 font-sans truncate">{it.cProd}</td>
                    <td className="p-0.5 border-r border-gray-200 font-sans uppercase font-medium truncate">{it.xProd}</td>
                    <td className="p-0.5 border-r border-gray-200">{it.ncm}</td>
                    <td className="p-0.5 border-r border-gray-200">{it.cst || it.csosn || '000'}</td>
                    <td className="p-0.5 border-r border-gray-200">{it.cfop}</td>
                    <td className="p-0.5 border-r border-gray-200">{it.uCom}</td>
                    <td className="p-0.5 border-r border-gray-200 text-right">{it.qCom}</td>
                    <td className="p-0.5 border-r border-gray-200 text-right">{formatBRL(it.vUnCom)}</td>
                    <td className="p-0.5 border-r border-gray-200 text-right font-bold">{formatBRL(it.vProd)}</td>
                    <td className="p-0.5 text-right">{it.pICMS > 0 ? `${it.pICMS}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 7. DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES */}
          <div className="border border-black p-1 grid grid-cols-12 gap-1 text-[7px] avoid-break">
            <div className="col-span-8 border-r border-black pr-1">
              <div className="font-bold uppercase text-[6.5px] text-gray-700 mb-0.5">
                INFORMAÇÕES COMPLEMENTARES
              </div>
              <p className="text-gray-800 leading-tight">
                DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL / REGIME NORMAL.
                OPERAÇÃO SUJEITA AO REGIME DE SUBSTITUIÇÃO TRIBUTÁRIA DE AUTOPEÇAS CONFORME PROTOCOLO ICMS 41/2008 E CONVÊNIO ICMS 142/2018.
                ALÍQUOTA INTERNA PR 19,50%. MVA AJUSTADA: 104,86% (IMPORTADOS 4%) / 87,78% (NACIONAIS 12%).
              </p>
            </div>
            <div className="col-span-4 pl-1">
              <div className="font-bold uppercase text-[6.5px] text-gray-700 mb-0.5">
                RESERVADO AO FISCO
              </div>
              <div className="text-gray-500 font-mono text-[6.5px] leading-tight">
                CHAVE: {auditoria.chaveAcesso}<br />
                AUTORIZADOR: SEFAZ VIRTUAL
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
