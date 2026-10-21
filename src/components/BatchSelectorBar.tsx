import React from 'react';
import { Files, Layers, CheckCircle2, ChevronRight, Download, Printer, Plus, Trash2 } from 'lucide-react';
import { ResumoAuditoriaNFe, NFeParsed } from '../types/fiscal';

export interface BatchItem {
  id: string;
  fileName: string;
  xml: string;
  parsed: NFeParsed;
  audit: ResumoAuditoriaNFe;
}

interface BatchSelectorBarProps {
  batchItems: BatchItem[];
  selectedBatchId: string; // 'ALL' or item.id
  onSelectBatchId: (id: string) => void;
  onOpenMassImportModal: () => void;
  onClearBatch: () => void;
}

export const BatchSelectorBar: React.FC<BatchSelectorBarProps> = ({
  batchItems,
  selectedBatchId,
  onSelectBatchId,
  onOpenMassImportModal,
  onClearBatch,
}) => {
  if (batchItems.length <= 1) return null;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  const totalProdLote = batchItems.reduce((acc, b) => acc + (b.parsed.totaisXML?.vProd || 0), 0);
  const totalNfLote = batchItems.reduce((acc, b) => acc + (b.parsed.totaisXML?.vNF || 0), 0);
  const totalStLote = batchItems.reduce((acc, b) => acc + (b.audit.totalARecolher || 0), 0);
  const totalCustoLote = totalNfLote + totalStLote;
  const totalItensLote = batchItems.reduce((acc, b) => acc + b.audit.itensAuditados.length, 0);

  return (
    <div className="bg-white border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3.5 no-print animate-fade-in">
      {/* Top Banner de Resumo do Lote */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <Files className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200/90 px-2 py-0.5 rounded">
                Lote Consolidado Ativo
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">
                {batchItems.length} Notas Fiscais · {totalItensLote} Peças Auditadas
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              Consolidado de Compras: <span className="text-emerald-800 font-mono font-black tabular-nums">{formatBRL(totalCustoLote)}</span> <span className="text-slate-400 font-normal text-xs font-mono">(NF-es: {formatBRL(totalNfLote)} + ST: {formatBRL(totalStLote)})</span>
            </h3>
          </div>
        </div>

        {/* Botões de Ação do Lote */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenMassImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-700" />
            <span>Adicionar XMLs</span>
          </button>

          <button
            type="button"
            onClick={onClearBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            title="Voltar para auditoria individual"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Encerrar Lote</span>
          </button>
        </div>
      </div>

      {/* Seletor de NFs do Lote */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Visualização Analítica:
        </div>
        <div className="flex items-center flex-wrap gap-2 pt-0.5">
          {/* Opção 1: CONSOLIDADO DE TODAS AS NFs */}
          <button
            type="button"
            onClick={() => onSelectBatchId('ALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBatchId === 'ALL'
                ? 'bg-slate-900 text-emerald-400 shadow-xs border border-emerald-500/40'
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Visão Consolidada ({batchItems.length} NFs · {formatBRL(totalStLote)} ST)</span>
          </button>

          {/* Opção por NF-e individual */}
          {batchItems.map((item, idx) => {
            const isSelected = selectedBatchId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectBatchId(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
                <span>NF-e {item.audit.nNF} ({item.parsed.emitente.uf})</span>
                <span className="font-mono tabular-nums text-[11px] font-bold opacity-95">
                  {formatBRL(item.audit.totalARecolher)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
