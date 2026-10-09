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
    <div className="bg-white border border-[#16A34A]/40 rounded-2xl p-4 shadow-sm space-y-3 no-print animate-fade-in">
      {/* Top Banner de Resumo do Lote */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30 flex items-center justify-center shrink-0">
            <Files className="h-5 w-5 text-[#16A34A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-[#166534] tracking-wide">
                Lote em Massa Ativo
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30">
                {batchItems.length} Notas Fiscais ({totalItensLote} Peças Auditadas)
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#1F2937] mt-0.5">
              Consolidado de Compras: <span className="text-[#166534] font-mono">{formatBRL(totalCustoLote)}</span> (NF-es: {formatBRL(totalNfLote)} + ST: {formatBRL(totalStLote)})
            </h3>
          </div>
        </div>

        {/* Botões de Ação do Lote */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenMassImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#166534] border border-[#16A34A]/30 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5 text-[#16A34A]" />
            <span>Adicionar Mais XMLs</span>
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
      <div className="space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Selecione a Visualização Desejada:
        </div>
        <div className="flex items-center flex-wrap gap-2 pt-1">
          {/* Opção 1: CONSOLIDADO DE TODAS AS NFs */}
          <button
            type="button"
            onClick={() => onSelectBatchId('ALL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBatchId === 'ALL'
                ? 'bg-[#16A34A] text-white shadow-md shadow-green-500/20'
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>📊 Visão Consolidada de Todas as {batchItems.length} NFs ({formatBRL(totalStLote)} ST)</span>
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
                    ? 'bg-[#166534] text-white font-bold shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
                <span>NF-e {item.audit.nNF} ({item.parsed.emitente.uf})</span>
                <span className="font-mono text-[11px] font-bold opacity-90">
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
