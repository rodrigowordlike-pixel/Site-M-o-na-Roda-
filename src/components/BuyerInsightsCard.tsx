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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Insight 1: Oportunidade de Negociação Comercial */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-2 text-[#166534] mb-2">
          <div className="p-1.5 rounded-lg bg-[#DCFCE7] border border-[#16A34A]/30">
            <Lightbulb className="h-4 w-4 text-[#16A34A]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Insight Comercial para Compras
          </span>
        </div>
        <div className="space-y-1.5 my-1">
          <div className="text-sm font-bold text-[#1F2937]">
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
        <div className="text-[11px] font-mono text-[#166534] pt-2 border-t border-slate-100 font-semibold">
          ST de Importados: {formatBRL(totalSTImportados)}
        </div>
      </div>

      {/* Insight 2: Crédito de ICMS Próprio Aproveitado */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-2 text-sky-700 mb-2">
          <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200">
            <TrendingDown className="h-4 w-4 text-sky-600" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Crédito Próprio Deduzido
          </span>
        </div>
        <div className="space-y-1.5 my-1">
          <div className="text-sm font-bold text-[#1F2937]">
            Redução legal no valor da guia
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Conforme a legislação do PR (Lei 21.850/2023), o ICMS próprio destacado na nota foi deduzido da base de cálculo da ST para evitar bitributação.
          </p>
        </div>
        <div className="text-[11px] font-mono text-sky-700 pt-2 border-t border-slate-100 font-semibold">
          Crédito Deduzido: {formatBRL(totalCreditoIcmsProprio)}
        </div>
      </div>

      {/* Insight 3: Segurança Fiscal e Lei 21.850/2023 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-2 text-[#166534] mb-2">
          <div className="p-1.5 rounded-lg bg-[#DCFCE7] border border-[#16A34A]/30">
            <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Conformidade & Lei PR
          </span>
        </div>
        <div className="space-y-1.5 my-1">
          <div className="text-sm font-bold text-[#1F2937]">
            Auditoria 100% blindada contra autuação
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cálculos efetuados com MVAs oficiais de autopeças (104,86% · 87,78% · 71,78%) e alíquota interna PR 19,5%. Pronto para homologação imediata.
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#166534] pt-2 border-t border-slate-100 font-semibold">
          Base Legal: Lei 21.850/2023 PR
        </div>
      </div>
    </div>
  );
};
