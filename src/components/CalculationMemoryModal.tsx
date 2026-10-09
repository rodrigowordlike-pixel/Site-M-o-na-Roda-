import React from 'react';
import { X, ExternalLink, Calculator, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ItemAuditoria } from '../types/fiscal';

interface CalculationMemoryModalProps {
  itemAuditoria: ItemAuditoria | null;
  onClose: () => void;
}

export const CalculationMemoryModal: React.FC<CalculationMemoryModalProps> = ({
  itemAuditoria,
  onClose,
}) => {
  if (!itemAuditoria) return null;

  const mem = itemAuditoria.memoriaCalculo;
  const item = itemAuditoria.item;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DCFCE7] text-[#16A34A]">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>MEMÓRIA DE CÁLCULO ANALÍTICA</span>
                <span>·</span>
                <span className="font-mono text-[#166534] font-bold">Item #{item.nItem.toString().padStart(2, '0')}</span>
              </div>
              <h3 className="text-base font-bold text-[#1F2937] truncate max-w-xl">
                {item.xProd}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1F2937] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Status & Classification */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Enquadramento Operacional:</span>
              <span className="font-bold text-[#1F2937] text-sm">
                {itemAuditoria.classificacaoDescricao}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block mb-0.5">Total a Recolher pelo Destinatário:</span>
              <span className="font-mono text-xl font-extrabold text-[#166534]">
                {formatBRL(itemAuditoria.totalRecolher)}
              </span>
            </div>
          </div>

          {/* Missing info warning if applicable */}
          {itemAuditoria.statusCalculo === 'NAO_CONFIRMADO' && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-900">Atenção: Cálculo Marcado como Não Confirmado</div>
                  <div className="mt-1 font-mono text-[11px]">{itemAuditoria.motivoNaoConfirmado}</div>
                </div>
              </div>
            </div>
          )}

          {/* Step-by-Step Mathematical Computation */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1F2937] uppercase tracking-wider text-xs border-b border-slate-200 pb-2">
              Passo a Passo da Memória Fiscal
            </h4>
            <div className="space-y-2 font-mono">
              {mem.passoAPasso.map((passo, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 shadow-2xs"
                >
                  {passo}
                </div>
              ))}
            </div>
          </div>

          {/* Base Legal e Parâmetros */}
          <div className="p-4 rounded-xl bg-[#DCFCE7]/40 border border-[#16A34A]/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#166534]">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <span>Base Legal e Parâmetros Aplicados:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div>• MVA Aplicada: <strong>{itemAuditoria.mva.toFixed(2)}%</strong></div>
              <div>• Alíquota Interna PR: <strong>19,5%</strong></div>
              <div>• Origem da Peça: <strong>{item.origem} - {item.origem === '0' ? 'Nacional' : 'Importada'}</strong></div>
              <div>• Lei de Referência: <strong>Lei PR 21.850/2023</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
