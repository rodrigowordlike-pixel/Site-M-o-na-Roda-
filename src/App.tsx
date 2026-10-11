import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { XmlUploader } from './components/XmlUploader';
import { BuyerExecutivePanel } from './components/BuyerExecutivePanel';
import { BuyerInsightsCard } from './components/BuyerInsightsCard';
import { FiscalHomologationView } from './components/FiscalHomologationView';
import { StateTaxRatesMatrix } from './components/StateTaxRatesMatrix';
import { ProductDetailTable } from './components/ProductDetailTable';
import { CalculationMemoryModal } from './components/CalculationMemoryModal';
import { LegalSourcesModal } from './components/LegalSourcesModal';
import { LegislativeRadarModal } from './components/LegislativeRadarModal';
import { AiFiscalAuditModal } from './components/AiFiscalAuditModal';
import { PrintableCalculationSheet } from './components/PrintableCalculationSheet';
import { DanfeModal } from './components/DanfeModal';
import { FiscalBorderoModal } from './components/FiscalBorderoModal';
import { LoadingGameOverlay } from './components/LoadingGameOverlay';
import { MassImportModal } from './components/MassImportModal';
import { NFeProductExportModal } from './components/NFeProductExportModal';
import { BatchSelectorBar, BatchItem } from './components/BatchSelectorBar';
import { ShoppingCart, Scale, Globe, Printer, FileText, Download, Receipt, Mail, Sparkles, FileSpreadsheet } from 'lucide-react';

import { parseNFeXML } from './services/xmlParser';
import { processarAuditoriaNFe } from './services/fiscalAuditorEngine';
import { SAMPLE_NFES } from './data/sampleXmls';
import { NFeParsed, ResumoAuditoriaNFe, ItemAuditoria, ModalidadeMvaAutopecas } from './types/fiscal';
import { useFiscalRadar } from './hooks/useFiscalRadar';

export default function App() {
  const radar = useFiscalRadar();
  const [currentXml, setCurrentXml] = useState<string>('');
  const [nfeParsed, setNfeParsed] = useState<NFeParsed | null>(null);
  const [auditoria, setAuditoria] = useState<ResumoAuditoriaNFe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemMemoria, setSelectedItemMemoria] = useState<ItemAuditoria | null>(null);
  const [modalidadeAutopecas, setModalidadeAutopecas] = useState<ModalidadeMvaAutopecas>('MVA_71_78');
  const [activeTab, setActiveTab] = useState<'BUYER' | 'FISCAL'>('BUYER');
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  // Estado para Importação em Massa (Batch)
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');

  // Modais
  const [isDanfeOpen, setIsDanfeOpen] = useState(false);
  const [isBorderoOpen, setIsBorderoOpen] = useState(false);
  const [isStatesMatrixOpen, setIsStatesMatrixOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isLegisOpen, setIsLegisOpen] = useState(false);
  const [isAiAuditOpen, setIsAiAuditOpen] = useState(false);
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false);
  const [isMassImportOpen, setIsMassImportOpen] = useState(false);
  const [isProductExportOpen, setIsProductExportOpen] = useState(false);
  const [printSheetMode, setPrintSheetMode] = useState<'SIMPLIFICADO' | 'ANALITICO'>('SIMPLIFICADO');

  // Funções para consolidação de lote
  const createConsolidatedNFeParsed = (items: BatchItem[]): NFeParsed => {
    const first = items[0]?.parsed;
    if (!first) throw new Error('Nenhum item válido no lote');
    const totalProd = items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vProd || 0), 0);
    const totalNF = items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vNF || 0), 0);
    const totalST = items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vST || 0), 0);
    const totalBCST = items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vBCST || 0), 0);
    const totalICMS = items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vICMS || 0), 0);
    const totalBC = items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vBC || 0), 0);

    return {
      ...first,
      nNF: `LOTE (${items.length} NFs)`,
      serie: 'MASSA',
      dhEmi: first.dhEmi || new Date().toISOString(),
      dEmiFormatada: `${items.length} Notas Importadas`,
      emitente: {
        ...(first.emitente || {}),
        xNome: `Lote Consolidado (${items.length} Fornecedores)`,
      } as any,
      destinatario: first.destinatario,
      totaisXML: {
        vProd: totalProd,
        vNF: totalNF,
        vST: totalST,
        vBCST: totalBCST,
        vICMS: totalICMS,
        vBC: totalBC,
        vFCP: items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vFCP || 0), 0),
        vFCPST: items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vFCPST || 0), 0),
        vIPI: items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vIPI || 0), 0),
        vFrete: items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vFrete || 0), 0),
        vSeg: items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vSeg || 0), 0),
        vDesc: items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vDesc || 0), 0),
        vOutro: items.reduce((acc, i) => acc + (i.parsed?.totaisXML?.vOutro || 0), 0),
      },
      itens: items.flatMap((i) => i.parsed?.itens || []),
    };
  };

  const createConsolidatedAuditoria = (items: BatchItem[]): ResumoAuditoriaNFe => {
    const first = items[0]?.audit;
    if (!first) throw new Error('Nenhuma auditoria válida no lote');
    const totalARecolher = items.reduce((acc, i) => acc + (i.audit?.totalARecolher || 0), 0);

    const allItensAuditados = items.flatMap((b) =>
      (b.audit?.itensAuditados || []).map((it) => ({
        ...it,
        item: {
          ...it.item,
          xProd: `[NF ${b.audit?.nNF || 'N/D'}] ${it.item?.xProd || 'Produto'}`,
        },
      }))
    );

    return {
      ...first,
      nNF: `LOTE (${items.length} NFs)`,
      serie: 'MASSA',
      chaveAcesso: `LOTE-${items.length}-NOTAS-FISCAIS`,
      statusGeral: 'CONFIRMADO',
      totalARecolher,
      itensAuditados: allItensAuditados,
      inconsistencias: items.flatMap((i) => i.audit?.inconsistencias || []),
    };
  };

  const handleProcessBatchXmls = (
    filesData: { name: string; content: string }[],
    novaModalidade: ModalidadeMvaAutopecas = modalidadeAutopecas
  ) => {
    try {
      const items: BatchItem[] = [];
      filesData.forEach((file) => {
        try {
          const parsed = parseNFeXML(file.content);
          const audit = processarAuditoriaNFe(parsed, 'Revenda', {
            forcarSTTodos: true,
            itensCustom: {},
            modalidadeAutopecas: novaModalidade,
          });
          items.push({
            id: `${parsed.nNF}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            fileName: file.name,
            xml: file.content,
            parsed,
            audit,
          });
        } catch (e) {
          console.error(`Erro ao processar XML ${file.name}:`, e);
        }
      });

      if (items.length === 0) {
        alert('Nenhum arquivo XML válido foi processado no lote.');
        return;
      }

      setBatchItems(items);
      setSelectedBatchId('ALL');
      setModalidadeAutopecas(novaModalidade);

      if (items.length === 1) {
        setNfeParsed(items[0].parsed);
        setAuditoria(items[0].audit);
        setCurrentXml(items[0].xml);
      } else {
        const consolidatedParsed = createConsolidatedNFeParsed(items);
        const consolidatedAudit = createConsolidatedAuditoria(items);
        setNfeParsed(consolidatedParsed);
        setAuditoria(consolidatedAudit);
        setCurrentXml(items[0].xml);
      }
    } catch (err: any) {
      alert(`Falha na importação em massa: ${err?.message || 'Erro ao processar lote'}`);
    }
  };

  const handleSelectBatchId = (id: string) => {
    setSelectedBatchId(id);
    if (id === 'ALL' && batchItems.length > 1) {
      const consolidatedParsed = createConsolidatedNFeParsed(batchItems);
      const consolidatedAudit = createConsolidatedAuditoria(batchItems);
      setNfeParsed(consolidatedParsed);
      setAuditoria(consolidatedAudit);
      setCurrentXml(batchItems[0].xml);
    } else {
      const found = batchItems.find((b) => b.id === id);
      if (found) {
        setNfeParsed(found.parsed);
        setAuditoria(found.audit);
        setCurrentXml(found.xml);
      }
    }
  };

  const handleAnalyzeXml = (
    xmlString: string,
    novaFinalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao' = 'Revenda',
    novaModalidade: ModalidadeMvaAutopecas = modalidadeAutopecas
  ) => {
    try {
      setBatchItems([]);
      setSelectedBatchId('ALL');

      const parsed = parseNFeXML(xmlString);
      setNfeParsed(parsed);
      setCurrentXml(xmlString);
      setModalidadeAutopecas(novaModalidade);

      const auditResult = processarAuditoriaNFe(parsed, 'Revenda', {
        forcarSTTodos: true,
        itensCustom: {},
        modalidadeAutopecas: novaModalidade,
      });
      setAuditoria(auditResult);
    } catch (err: any) {
      alert(`Falha no processamento fiscal do XML: ${err?.message || 'Arquivo corrompido ou malformado'}`);
    }
  };

  const handleAnalyzeParsedNFe = (
    parsed: NFeParsed,
    novaModalidade: ModalidadeMvaAutopecas = modalidadeAutopecas
  ) => {
    try {
      setBatchItems([]);
      setSelectedBatchId('ALL');
      setNfeParsed(parsed);
      setCurrentXml(`<nfeProc><NFe><infNFe Id="${parsed.chNFe}"><ide><nNF>${parsed.nNF}</nNF></ide></infNFe></NFe></nfeProc>`);
      setModalidadeAutopecas(novaModalidade);

      const auditResult = processarAuditoriaNFe(parsed, 'Revenda', {
        forcarSTTodos: true,
        itensCustom: {},
        modalidadeAutopecas: novaModalidade,
      });
      setAuditoria(auditResult);
    } catch (err: any) {
      alert(`Falha no processamento fiscal: ${err?.message || 'Erro ao processar chave'}`);
    }
  };

  const handleDownloadXml = () => {
    if (!currentXml || !auditoria) return;
    const blob = new Blob([currentXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFe-${auditoria.chaveAcesso || auditoria.nNF}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col antialiased">
      <LoadingGameOverlay
        isLoading={isLoading}
        onComplete={() => {
          if (pendingPayload) {
            if (pendingPayload.batch) {
              handleProcessBatchXmls(pendingPayload.batch, pendingPayload.mod || modalidadeAutopecas);
            } else if (pendingPayload.parsed) {
              handleAnalyzeParsedNFe(pendingPayload.parsed, pendingPayload.mod || modalidadeAutopecas);
            } else if (pendingPayload.xml) {
              handleAnalyzeXml(pendingPayload.xml, 'Revenda', pendingPayload.mod || modalidadeAutopecas);
            } else if (typeof pendingPayload === 'string') {
              handleAnalyzeXml(pendingPayload, 'Revenda', modalidadeAutopecas);
            }
            setPendingPayload(null);
          }
          setIsLoading(false);
          setTimeout(() => {
            const el = document.getElementById('audit-results-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }
          }, 150);
        }}
      />

      {/* Header com Navegação e Ações Rápidas */}
      <Header
        auditoria={auditoria}
        onOpenRadar={() => setIsRadarOpen(true)}
        onOpenLegis={() => setIsLegisOpen(true)}
        onOpenAiAudit={() => setIsAiAuditOpen(true)}
        onOpenPrint={() => setIsPrintSheetOpen(true)}
        onOpenMassImport={() => setIsMassImportOpen(true)}
        onOpenProductExport={() => setIsProductExportOpen(true)}
        onOpenAutopecasGuide={() => setIsStatesMatrixOpen(true)}
        unreadCount={radar.unreadCount}
        countdownFormatted={radar.countdownFormatted}
        isSyncing={radar.isSyncing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3.5 no-print">
        {/* 1. Uploader de XML */}
        <section className="no-print">
          <XmlUploader
            onAnalyzeXml={handleAnalyzeXml}
            onAnalyzeBatchXmls={handleProcessBatchXmls}
            isLoading={isLoading}
            modalidadeAutopecas={modalidadeAutopecas}
            onChangeModalidadeAutopecas={(m) => {
              setModalidadeAutopecas(m);
              if (nfeParsed) {
                const auditResult = processarAuditoriaNFe(nfeParsed, 'Revenda', {
                  forcarSTTodos: true,
                  itensCustom: {},
                  modalidadeAutopecas: m,
                });
                setAuditoria(auditResult);
              }
            }}
            onStartLoadingGame={(payload, mod) => {
              if (typeof payload === 'object' && payload.batch) {
                setPendingPayload({ batch: payload.batch, mod });
              } else if (typeof payload === 'object' && payload.parsed) {
                setPendingPayload({ parsed: payload.parsed, mod });
              } else {
                setPendingPayload({ xml: payload, mod });
              }
              setIsLoading(true);
            }}
            onOpenMassImportModal={() => setIsMassImportOpen(true)}
            onOpenProductExport={() => setIsProductExportOpen(true)}
          />
        </section>

        {/* Barra de Seleção e Controle do Lote em Massa (Exibida se houver 2 ou mais NFs no lote) */}
        {batchItems.length > 1 && (
          <BatchSelectorBar
            batchItems={batchItems}
            selectedBatchId={selectedBatchId}
            onSelectBatchId={handleSelectBatchId}
            onOpenMassImportModal={() => setIsMassImportOpen(true)}
            onClearBatch={() => {
              setBatchItems([]);
              setSelectedBatchId('ALL');
            }}
          />
        )}

        {auditoria && nfeParsed && (
          <div id="audit-results-section" className="space-y-5 pt-2">
            {/* 2. As Apenas 2 Opções de Visão */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 no-print gap-3">
              <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 text-xs font-semibold shadow-2xs">
                <button
                  onClick={() => setActiveTab('BUYER')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'BUYER'
                      ? 'bg-[#16A34A] text-white font-black shadow-md shadow-green-500/20'
                      : 'text-slate-600 hover:text-[#1F2937]'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>1. VISÃO DO COMPRADOR (A Nota, Custo Real & ST)</span>
                </button>

                <button
                  onClick={() => setActiveTab('FISCAL')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'FISCAL'
                      ? 'bg-[#16A34A] text-white font-black shadow-md shadow-green-500/20'
                      : 'text-slate-600 hover:text-[#1F2937]'
                  }`}
                >
                  <Scale className="h-4 w-4" />
                  <span>2. VISÃO FISCAL (Homologação & Borderô para Pagar a Guia)</span>
                </button>
              </div>

              {/* Botões Rápidos de Ação */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setIsDanfeOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1F2937] border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Exibir o espelho oficial do DANFE"
                >
                  <FileText className="h-4 w-4 text-[#16A34A]" />
                  <span>Exibir DANFE</span>
                </button>

                <button
                  onClick={handleDownloadXml}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1F2937] border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Baixar arquivo XML da NF-e"
                >
                  <Download className="h-4 w-4 text-sky-600" />
                  <span>Baixar XML</span>
                </button>

                <button
                  onClick={() => setIsProductExportOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Exportar produtos para planilha Excel (.xlsx) no padrão oficial de 8 colunas com separação inteligente de descrição e aplicação"
                >
                  <FileSpreadsheet className="h-4 w-4 text-[#16A34A]" />
                  <span>Exportar Produtos (.xlsx)</span>
                </button>

                {activeTab === 'BUYER' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setPrintSheetMode('SIMPLIFICADO');
                        setIsPrintSheetOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-green-500/20"
                      title="Imprimir relatório simplificado (1 folha A4 anexo da NF)"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Imprimir Simplificado</span>
                    </button>

                    <button
                      onClick={() => {
                        setPrintSheetMode('ANALITICO');
                        setIsPrintSheetOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1F2937] border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title="Imprimir relatório analítico detalhado item a item"
                    >
                      <span>Item a Item</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsBorderoOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-green-500/20"
                    title="Imprimir borderô sintético da ST para o pagamento da guia"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Imprimir Borderô da ST</span>
                  </button>
                )}
              </div>
            </div>

            {/* OPÇÃO 1: VISÃO DO COMPRADOR */}
            {activeTab === 'BUYER' && (
              <div className="space-y-6">
                <BuyerExecutivePanel
                  auditoria={auditoria}
                  nfeParsed={nfeParsed}
                  finalidade="Revenda"
                  onChangeFinalidade={() => {}}
                  onOpenPrint={(mode) => {
                    setPrintSheetMode(mode || 'SIMPLIFICADO');
                    setIsPrintSheetOpen(true);
                  }}
                  onOpenAiAudit={() => setIsAiAuditOpen(true)}
                  onOpenDanfe={() => setIsDanfeOpen(true)}
                  onDownloadXml={handleDownloadXml}
                />

                <BuyerInsightsCard
                  auditoria={auditoria}
                  nfeParsed={nfeParsed}
                />

                <ProductDetailTable
                  itens={auditoria.itensAuditados}
                  onSelectMemoria={(item) => setSelectedItemMemoria(item)}
                  onOpenProductExport={() => setIsProductExportOpen(true)}
                />
              </div>
            )}

            {/* OPÇÃO 2: VISÃO FISCAL (Homologação da Guia & Borderô) */}
            {activeTab === 'FISCAL' && (
              <div className="space-y-6">
                <FiscalHomologationView
                  auditoria={auditoria}
                  nfeParsed={nfeParsed}
                  onOpenPrint={() => setIsPrintSheetOpen(true)}
                  onOpenBordero={() => setIsBorderoOpen(true)}
                  onOpenDanfe={() => setIsDanfeOpen(true)}
                  onDownloadXml={handleDownloadXml}
                />

                <ProductDetailTable
                  itens={auditoria.itensAuditados}
                  onSelectMemoria={(item) => setSelectedItemMemoria(item)}
                  onOpenProductExport={() => setIsProductExportOpen(true)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Profissional */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-600 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Coluna 1: Marca & Autoria */}
            <div className="space-y-1 text-center md:text-left">
              <div className="font-extrabold text-[#16A34A] tracking-wider text-sm">MÃO NA RODA</div>
              <p className="text-slate-500 text-[11px]">
                Desenvolvido por <span className="text-[#1F2937] font-semibold">Rodrigo Narciso</span>
              </p>
            </div>

            {/* Coluna 2: Parâmetros Oficiais de Autopeças */}
            <div className="text-center space-y-1 bg-[#F8FAFC] border border-slate-200 rounded-xl py-2.5 px-3">
              <div className="text-[11px] text-[#1F2937] font-bold">MVA Oficial de Autopeças & Alíquota PR</div>
              <div className="text-[10px] text-slate-500">
                104,86% Imp · 87,78% Nac · 71,78% Orig · PR 19,5% (Lei 21.850/2023)
              </div>
            </div>

            {/* Coluna 3: Links e Versão */}
            <div className="flex items-center justify-center md:justify-end gap-4 text-[11px]">
              <button
                onClick={() => setIsStatesMatrixOpen(true)}
                className="hover:text-[#16A34A] transition-colors cursor-pointer text-slate-700 font-semibold"
              >
                Alíquotas 27 UFs
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => setIsLegisOpen(true)}
                className="hover:text-[#16A34A] transition-colors cursor-pointer text-slate-700 font-semibold"
              >
                Legislação
              </button>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400 font-mono">v2026.4</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal: Visualizador Completo do DANFE */}
      <DanfeModal
        isOpen={isDanfeOpen}
        onClose={() => setIsDanfeOpen(false)}
        nfeParsed={nfeParsed}
        auditoria={auditoria}
        rawXml={currentXml}
      />

      {/* Modal: Borderô Fiscal de Pagamento da ST */}
      <FiscalBorderoModal
        isOpen={isBorderoOpen}
        onClose={() => setIsBorderoOpen(false)}
        nfeParsed={nfeParsed}
        auditoria={auditoria}
      />

      {/* Modal: Alíquotas das 27 UFs */}
      {isStatesMatrixOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#16A34A]" />
                Alíquotas das 27 UFs para Autopeças
              </h3>
              <button
                onClick={() => setIsStatesMatrixOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1F2937] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <StateTaxRatesMatrix />
          </div>
        </div>
      )}

      {/* Modal: Memória de Cálculo Analítica do Item */}
      <CalculationMemoryModal
        itemAuditoria={selectedItemMemoria}
        onClose={() => setSelectedItemMemoria(null)}
      />

      {/* Modal: Hierarquia e Links de Legislação Oficial */}
      <LegalSourcesModal
        isOpen={isLegisOpen}
        onClose={() => setIsLegisOpen(false)}
      />

      {/* Modal: Radar de Alterações Tributárias Oficiais (Caixa de Mensagens) */}
      <LegislativeRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        ufDestaque={auditoria?.ufDestino}
        alteracoes={radar.alteracoes}
        readIds={radar.readIds}
        unreadCount={radar.unreadCount}
        markAsRead={radar.markAsRead}
        markAsUnread={radar.markAsUnread}
        markAllAsRead={radar.markAllAsRead}
        markAllAsUnread={radar.markAllAsUnread}
        lastSyncDateFormatted={radar.lastSyncDateFormatted}
        countdownFormatted={radar.countdownFormatted}
        isSyncing={radar.isSyncing}
        syncNow={radar.syncNow}
        lastSyncStatusMessage={radar.lastSyncStatusMessage}
        currentYear={radar.currentYear}
        somenteAnoAtual={radar.somenteAnoAtual}
        setSomenteAnoAtual={radar.setSomenteAnoAtual}
        totalAnoAtual={radar.totalAnoAtual}
      />

      {/* Modal: Parecer Fiscal com Inteligência Artificial */}
      <AiFiscalAuditModal
        isOpen={isAiAuditOpen}
        onClose={() => setIsAiAuditOpen(false)}
        auditoria={auditoria}
      />

      {/* Modal: Folha de Memória de Cálculo para Impressão (Anexo NF-e) */}
      <PrintableCalculationSheet
        isOpen={isPrintSheetOpen}
        onClose={() => setIsPrintSheetOpen(false)}
        auditoria={auditoria}
        nfeParsed={nfeParsed}
        initialMode={printSheetMode}
      />

      {/* Modal: Importação em Massa de Múltiplos XMLs */}
      <MassImportModal
        isOpen={isMassImportOpen}
        onClose={() => setIsMassImportOpen(false)}
        modalidadeAutopecas={modalidadeAutopecas}
        isLoading={isLoading}
        onProcessBatchXmls={(filesData, mod) => {
          setIsLoading(true);
          setPendingPayload({ batch: filesData, mod });
        }}
      />

      {/* Modal: Exportador Inteligente de Produtos para Cadastro (Excel .xlsx - 8 Colunas) */}
      <NFeProductExportModal
        isOpen={isProductExportOpen}
        onClose={() => setIsProductExportOpen(false)}
        nfeParsed={nfeParsed}
      />
    </div>
  );
}
