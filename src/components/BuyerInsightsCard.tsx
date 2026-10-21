import React from 'react';
import {
  Lightbulb,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Receipt,
  HelpCircle
} from 'lucide-react';
import { ResumoAuditoriaNFe, NFeParsed } from '../types/fiscal';

interface BuyerInsightsCardProps {
  auditoria: ResumoAuditoriaNFe;
  nfeParsed: NFeParsed;
}

export const BuyerInsightsCard: React.FC<BuyerInsightsCardProps> = ({ auditoria, nfeParsed }) => {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  const totalProdutos = nfeParsed.totaisXML.vProd;
  const totalST = auditoria.totalARecolher;
  const itensImportados = auditoria.itensAuditados.filter((i) =>
    ['1', '2', '3', '8'].includes(i.item.origem)
  );
  const totalSTImportados = itensImportados.reduce((acc, i) => acc + i.totalRecolher, 0);
  const totalCreditoIcmsProprio = auditoria.itensAuditados.reduce(
    (acc, it) => acc + (it.memoriaCalculo?.icmsProprioDeduzivel || 0),
    0
  );

  const percentualImpactoImportado =
    itensImportados.length > 0
      ? (totalSTImportados / itensImportados.reduce((acc, i) => acc + i.item.vProd, 0)) * 100
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Insight 1: Oportunidade de Negociação Comercial */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-emerald-500 rounded-2xl p-5 lg:p-6 hover:border-slate-300 transition-all flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700">
            <Lightbulb className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Inteligência de Compras & Negociação
          </span>
        </div>
        <div className="space-y-1.5 my-1">
          <div className="text-base font-bold text-slate-900">
            {itensImportados.length > 0
              ? `${itensImportados.length} peças importadas exigem maior desconto`
              : 'Mix de peças 100% nacional'}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {itensImportados.length > 0
              ? `A MVA de 104,86% (alíquota 4%) elevou o custo das peças importadas em +${percentualImpactoImportado.toFixed(1)}%. Negocie com o fornecedor um desconto proporcional nessas peças.`
              : 'Todas as peças da nota são de origem nacional (12%), com MVA de 87,78% e menor carga tributária na entrada.'}
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-emerald-800 pt-3 border-t border-slate-100 font-bold flex items-center justify-between">
          <span>ST de Peças Importadas:</span>
          <span className="text-sm font-black">{formatBRL(totalSTImportados)}</span>
        </div>
      </div>

      {/* Insight 2: Crédito de ICMS Próprio Aproveitado */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-sky-500 rounded-2xl p-5 lg:p-6 hover:border-slate-300 transition-all flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-700">
            <TrendingDown className="h-4 w-4 text-sky-600" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Crédito Próprio Deduzido da Guia
          </span>
        </div>
        <div className="space-y-1.5 my-1">
          <div className="text-base font-bold text-slate-900">
            Redução legal no valor final a recolher
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Conforme a legislação do PR (Lei 21.850/2023), o ICMS próprio destacado na nota foi deduzido da base de cálculo da ST para evitar bitributação da cadeia.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-sky-800 pt-3 border-t border-slate-100 font-bold flex items-center justify-between">
          <span>Crédito Fiscal Aproveitado:</span>
          <span className="text-sm font-black">{formatBRL(totalCreditoIcmsProprio)}</span>
        </div>
      </div>

      {/* Insight 3: Segurança Fiscal e Lei 21.850/2023 */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-indigo-500 rounded-2xl p-5 lg:p-6 hover:border-slate-300 transition-all flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Blindagem Tributária & SEFAZ-PR
          </span>
        </div>
        <div className="space-y-1.5 my-1">
          <div className="text-base font-bold text-slate-900">
            Auditoria 100% blindada contra autuação
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cálculos auditados com MVAs oficiais de autopeças (104,86% · 87,78% · 71,78%) e alíquota interna PR 19,5%. Pronto para homologação contábil.
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-800 pt-3 border-t border-slate-100 font-bold flex items-center justify-between">
          <span>Fundamentação:</span>
          <span className="text-slate-800 font-bold">Lei 21.850/2023 PR</span>
        </div>
      </div>
    </div>
  );
};
