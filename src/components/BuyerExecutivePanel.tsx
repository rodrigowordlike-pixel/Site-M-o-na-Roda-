import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PackageCheck,
  Printer,
  Copy,
  Check,
  Layers,
  ArrowUpRight,
  Sparkles,
  Info,
  ShieldCheck,
  Car,
  FileText,
  Download
} from 'lucide-react';
import { ResumoAuditoriaNFe, NFeParsed } from '../types/fiscal';

interface BuyerExecutivePanelProps {
  auditoria: ResumoAuditoriaNFe;
  nfeParsed: NFeParsed;
  finalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao';
  onChangeFinalidade: (novaFinalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao') => void;
  onOpenPrint: (mode?: 'SIMPLIFICADO' | 'ANALITICO') => void;
  onOpenAiAudit: () => void;
  onOpenDanfe?: () => void;
  onDownloadXml?: () => void;
}

export const BuyerExecutivePanel: React.FC<BuyerExecutivePanelProps> = ({
  auditoria,
  nfeParsed,
  finalidade,
  onChangeFinalidade,
  onOpenPrint,
  onOpenAiAudit,
  onOpenDanfe,
  onDownloadXml,
}) => {
  const [copied, setCopied] = useState(false);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const valorProdutos = nfeParsed.totaisXML?.vProd || 0;
  const valorST =
    auditoria.totalARecolher && auditoria.totalARecolher > 0
      ? auditoria.totalARecolher
      : nfeParsed.totaisXML?.vST && nfeParsed.totaisXML?.vST > 0
      ? nfeParsed.totaisXML.vST
      : auditoria.icmsSTaRecolher || 0;
  const valorTotalNota = nfeParsed.totaisXML?.vNF || 0;
  const custoTotalCompra = valorTotalNota + (auditoria.totalARecolher || 0);
  const percentualImpactoST = valorProdutos > 0 ? (valorST / valorProdutos) * 100 : 0;

  // Estatísticas de Itens
  const itensImportados = auditoria.itensAuditados.filter((i) =>
    ['1', '2', '3', '8'].includes(i.item.origem)
  );
  const itensNacionais = auditoria.itensAuditados.filter(
    (i) => !['1', '2', '3', '8'].includes(i.item.origem)
  );
  const totalSTImportados = itensImportados.reduce((acc, i) => acc + i.totalRecolher, 0);
  const totalSTNacionais = itensNacionais.reduce((acc, i) => acc + i.totalRecolher, 0);

  const handleCopySummary = () => {
    const texto = `📊 *RESUMO DE COMPRA & ICMS-ST (MÃO NA RODA)*
📄 *NF-e:* ${auditoria.nNF} (Série ${auditoria.serie})
🏢 *Fornecedor:* ${nfeParsed.emitente.xNome} (${nfeParsed.emitente.uf})
🏷️ *Regime (XML):* ${nfeParsed.emitente.crtDescricao}
📍 *Destino:* ${nfeParsed.destinatario.xNome} (${nfeParsed.destinatario.uf})
🗓️ *Data:* ${auditoria.dataEmissao}

💰 *Valor dos Produtos:* ${formatBRL(valorProdutos)}
📦 *Valor Total da NF:* ${formatBRL(valorTotalNota)}
⚖️ *ICMS-ST a Recolher:* ${formatBRL(valorST)} (+${percentualImpactoST.toFixed(1)}%)
🏁 *CUSTO REAL DA COMPRA:* ${formatBRL(custoTotalCompra)}

🔹 Peças Importadas (MVA 104,86%): ${itensImportados.length} itens (ST: ${formatBRL(totalSTImportados)})
🔹 Peças Nacionais (MVA 87,78%): ${itensNacionais.length} itens (ST: ${formatBRL(totalSTNacionais)})
`;
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden">
      {/* Header do Card Executivo com Status e Dossiê */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 border border-emerald-500/30">
              <Car className="h-3.5 w-3.5" />
              Painel do Comprador · Mão na Roda Pro
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Fluxo Interestadual: <strong className="text-slate-800">{nfeParsed.emitente.uf}</strong> ➔ <strong className="text-slate-800">{nfeParsed.destinatario.uf}</strong> (Alíquota Interna PR 19,5%)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            NF-e {auditoria.nNF} · <span className="text-slate-600 font-bold">{nfeParsed.emitente.xNome}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 font-semibold">Enquadramento Tributário:</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-slate-50 border border-slate-200 shadow-2xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  nfeParsed.emitente.crt === '1' || nfeParsed.emitente.crt === '4'
                    ? 'bg-emerald-500'
                    : nfeParsed.emitente.crt === '2'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
              />
              <span className="text-slate-900">{nfeParsed.emitente.crtDescricao}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                CRT {nfeParsed.emitente.crt}
              </span>
            </div>
            {nfeParsed.emitente.crt === '1' || nfeParsed.emitente.crt === '4' ? (
              <span className="text-[11px] text-emerald-900 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                ✓ MVA Original mantida (Vedado ajuste pelo Conv. ICMS 35/2011)
              </span>
            ) : (
              <span className="text-[11px] text-blue-900 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                ✓ MVA Ajustada aplicada (Convênio ICMS 142/2018)
              </span>
            )}
          </div>
        </div>

        {/* Botão de Ação Rápida Executiva */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs transition-all shadow-xs hover:border-slate-300 cursor-pointer active:scale-[0.98]"
            title="Copiar resumo formatado para o WhatsApp ou Financeiro"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Resumo Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-500" />
                <span>Copiar Resumo Executivo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner Informativo quando o Fornecedor não reteve ST no XML */}
      {nfeParsed.totaisXML?.vST === 0 && valorST > 0 && (
        <div className="mt-4 p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl flex items-start gap-3 text-xs text-amber-950">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-amber-950 text-xs tracking-wide uppercase">
              ⚡ Nota Fiscal Sem Retenção na Origem (vICMSST = R$ 0,00 no XML)
            </span>
            <p className="leading-relaxed text-amber-900">
              O fornecedor <strong>{nfeParsed.emitente.xNome}</strong> ({nfeParsed.emitente.uf}) faturou sem ST retida na nota fiscal. O sistema calculou a <strong>ST de Antecipação Tributária na Entrada ({formatBRL(valorST)})</strong> devida para recolhimento pelo destinatário paranaense.
            </p>
          </div>
        </div>
      )}

      {/* Grid de Métricas Financeiras Executivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 py-6">
        {/* Card 1: Valor dos Produtos */}
        <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 lg:p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700">1. Valor dos Produtos</span>
            <div className="p-1.5 rounded-lg bg-white border border-slate-200">
              <PackageCheck className="h-4 w-4 text-slate-500" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
              {formatBRL(valorProdutos)}
            </div>
            <div className="text-xs text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span>Total Faturado NF:</span>
              <strong className="text-slate-800">{formatBRL(valorTotalNota)}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: ICMS-ST a Pagar */}
        <div className="bg-emerald-50/70 border border-emerald-300/80 rounded-2xl p-5 lg:p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-900 mb-2">
            <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              2. ICMS-ST a Recolher (Guia)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-200/80 text-emerald-950 font-black text-xs font-mono shadow-2xs">
              +{percentualImpactoST.toFixed(1)}% custo
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-emerald-800 font-mono tabular-nums tracking-tight">
              {formatBRL(valorST)}
            </div>
            <div className="text-xs text-emerald-800 font-semibold flex items-center justify-between pt-1 border-t border-emerald-200/60">
              <span>Guia GNRE/DARE (PR):</span>
              <span className="font-mono text-[11px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900 font-bold">Cód. 10008-0</span>
            </div>
          </div>
        </div>

        {/* Card 3: Custo Efetivo Real da Compra (Hero Luxury Card) */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col justify-between shadow-lg shadow-slate-950/10 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-400">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              3. Custo Real da Compra
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
              Total Efetivo
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-white font-mono tabular-nums tracking-tight">
              {formatBRL(custoTotalCompra)}
            </div>
            <div className="text-xs text-slate-300 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Produtos + Guia ST:</span>
              <span className="text-emerald-400 font-bold">{formatBRL(custoTotalCompra)}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Composição de Peças */}
        <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 lg:p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700">4. Segmentação de Origem</span>
            <span className="font-mono text-xs text-slate-800 font-bold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {auditoria.itensAuditados.length} peças
            </span>
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-900 flex items-center gap-1.5 font-semibold">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Importadas (MVA 104,86%):
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {itensImportados.length} ({formatBRL(totalSTImportados)})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-900 flex items-center gap-1.5 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Nacionais (MVA 87,78%):
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {itensNacionais.length} ({formatBRL(totalSTNacionais)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Distribuição Visual do Custo da Compra & Indicadores Executivos */}
      <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              Composição Visual do Desembolso Financeiro
            </span>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-sky-800">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-600 inline-block" />
                Produtos ({((valorProdutos / Math.max(custoTotalCompra, 1)) * 100).toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600 inline-block" />
                Guia ICMS-ST (+{percentualImpactoST.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden flex shadow-inner">
            <div
              className="bg-sky-600 h-full transition-all"
              style={{
                width: `${(valorProdutos / Math.max(custoTotalCompra, 1)) * 100}%`,
              }}
              title={`Produtos: ${formatBRL(valorProdutos)}`}
            />
            <div
              className="bg-emerald-600 h-full transition-all"
              style={{
                width: `${(valorST / Math.max(custoTotalCompra, 1)) * 100}%`,
              }}
              title={`ICMS-ST: ${formatBRL(valorST)}`}
            />
          </div>
        </div>

        {/* Mini Métricas de Apoio à Decisão de Compra */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0 pt-2 lg:pt-0 lg:border-l lg:border-slate-200 lg:pl-5">
          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-[11px]">
            <span className="text-slate-500 block">Impacto Médio/Peça:</span>
            <strong className="text-slate-900 font-mono text-xs">
              {formatBRL(auditoria.itensAuditados.length > 0 ? valorST / auditoria.itensAuditados.length : 0)}
            </strong>
          </div>

          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-[11px]">
            <span className="text-slate-500 block">Crédito Próprio Usado:</span>
            <strong className="text-sky-700 font-mono text-xs">
              {formatBRL(auditoria.itensAuditados.reduce((acc, it) => acc + (it.memoriaCalculo?.icmsProprioDeduzivel || 0), 0))}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
