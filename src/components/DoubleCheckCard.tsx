import React, { useState } from 'react';
import { CheckCheck, AlertOctagon, ArrowRight, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { ConferenciaDuplaItem } from '../types/fiscal';

interface DoubleCheckCardProps {
  conferencia: {
    itens: ConferenciaDuplaItem[];
    houveDivergencia: boolean;
    explicacaoDivergencia?: string;
  };
}

export const DoubleCheckCard: React.FC<DoubleCheckCardProps> = ({ conferencia }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const divergenciasCount = conferencia.itens.filter((it) => it.divergencia).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs mb-6">
      {/* Resumo Principal da Conferência Dupla */}
      <div className="p-5 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl ${
              conferencia.houveDivergencia
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30'
            }`}
          >
            {conferencia.houveDivergencia ? (
              <AlertOctagon className="h-5 w-5" />
            ) : (
              <CheckCheck className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1F2937] tracking-tight">
                Dupla Conferência Matemática Independente
              </h3>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                  conferencia.houveDivergencia
                    ? 'bg-rose-50 text-rose-700 border border-rose-300'
                    : 'bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30'
                }`}
              >
                {conferencia.houveDivergencia
                  ? '⚠️ DIVERGÊNCIA IDENTIFICADA'
                  : '100% HOMOLOGADA (0 DIVERGÊNCIAS)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {conferencia.itens.length} {conferencia.itens.length === 1 ? 'item verificado' : 'itens verificados'} · Divergências: {divergenciasCount}
            </p>
          </div>
        </div>

        {/* Botão de Exibir / Ocultar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1F2937] border border-slate-200 text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs"
        >
          <span>{isExpanded ? 'Ocultar Detalhes' : 'Exibir Detalhamento da Conferência'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
      </div>

      {conferencia.houveDivergencia && (
        <div className="bg-rose-50 border-t border-rose-200 p-4 px-6 text-xs text-rose-900">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-950 text-sm mb-1">
                ⚠️ DIVERGÊNCIA DE CÁLCULO DETECTADA
              </div>
              <p className="text-rose-800 mb-2">
                O valor não pode ser considerado definitivo sem análise da base de arredondamento.
              </p>
              {conferencia.explicacaoDivergencia && (
                <div className="p-2.5 rounded bg-white border border-rose-200 font-mono text-[11px] text-rose-950">
                  {conferencia.explicacaoDivergencia}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Itens da Conferência */}
      {isExpanded && (
        <div className="border-t border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Item</th>
                <th className="py-2.5 px-4">Produto</th>
                <th className="py-2.5 px-4 text-right">Motor A (Auditor)</th>
                <th className="py-2.5 px-4 text-right">Motor B (Calculadora)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {conferencia.itens.map((it) => (
                <tr key={it.itemNumero} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-500">#{it.itemNumero}</td>
                  <td className="py-2.5 px-4 font-sans font-medium text-[#1F2937]">{it.descricao}</td>
                  <td className="py-2.5 px-4 text-right">{formatBRL(it.calculo1.total)}</td>
                  <td className="py-2.5 px-4 text-right">{formatBRL(it.calculo2.total)}</td>
                  <td className="py-2.5 px-4 text-center">
                    {it.divergencia ? (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Divergente
                      </span>
                    ) : (
                      <span className="text-[#166534] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#16A34A]/30">
                        100% Ok
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
