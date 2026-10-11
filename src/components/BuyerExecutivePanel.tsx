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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Header do Card com Status e Ações Diretas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30">
              <Car className="h-3.5 w-3.5" />
              Painel do Comprador · Mão na Roda
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Origem: {nfeParsed.emitente.uf} ➔ Destino: {nfeParsed.destinatario.uf} (PR 19,5%)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F2937] tracking-tight flex items-center gap-2">
            NF-e {auditoria.nNF} · <span className="text-slate-600 font-semibold">{nfeParsed.emitente.xNome}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 font-medium">Regime Tributário do Emitente:</span>
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
              <span className="text-[#1F2937]">{nfeParsed.emitente.crtDescricao}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                Conforme XML (CRT {nfeParsed.emitente.crt})
              </span>
            </div>
            {nfeParsed.emitente.crt === '1' || nfeParsed.emitente.crt === '4' ? (
              <span className="text-[11px] text-[#166534] font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ MVA Original mantida (Vedado ajuste pelo Conv. ICMS 35/2011)
              </span>
            ) : (
              <span className="text-[11px] text-blue-800 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                ✓ MVA Ajustada aplicada (Convênio ICMS 142/2018)
              </span>
            )}
          </div>
        </div>

        {/* Botão de Ação Rápida */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 font-semibold text-xs transition-all shadow-xs cursor-pointer"
            title="Copiar resumo formatado para o WhatsApp ou Financeiro"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#16A34A]" />
                <span className="text-[#16A34A]">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-500" />
                <span>Copiar Resumo para WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner Informativo quando o Fornecedor não reteve ST no XML mas a ST é devida na Entrada */}
      {nfeParsed.totaisXML?.vST === 0 && valorST > 0 && (
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950 text-xs">
              ⚡ NOTA FISCAL EMITIDA SEM RETENÇÃO DE ST NA ORIGEM (vICMSST = R$ 0,00 NO XML)
            </span>
            <span>
              O fornecedor <strong>{nfeParsed.emitente.xNome}</strong> ({nfeParsed.emitente.uf}) emitiu a nota fiscal com ST destacada em R$ 0,00 no XML. A ferramenta Mão na Roda calculou automaticamente a <strong>ST de Antecipação Tributária na Entrada ({formatBRL(valorST)})</strong> devida para recolhimento pelo destinatário no {nfeParsed.destinatario.uf}.
            </span>
          </div>
        </div>
      )}

      {/* Grid de Métricas Financeiras Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
        {/* Card 1: Valor dos Produtos */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">1. Valor dos Produtos</span>
            <PackageCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#1F2937] font-mono tracking-tight">
              {formatBRL(valorProdutos)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Total NF: {formatBRL(valorTotalNota)}
            </div>
          </div>
        </div>

        {/* Card 2: ICMS-ST a Pagar */}
        <div className="bg-[#DCFCE7]/70 border border-[#16A34A]/40 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#166534] mb-2">
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              2. ICMS-ST a Pagar (Guia)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#16A34A]/20 text-[#166534] font-bold text-[10px]">
              +{percentualImpactoST.toFixed(1)}% custo
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#166534] font-mono tracking-tight">
              {formatBRL(valorST)}
            </div>
            <div className="text-[11px] text-[#166534]/80 mt-1">
              Responsabilidade do Destinatário
            </div>
          </div>
        </div>

        {/* Card 3: Custo Efetivo Real da Compra */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-2">
            <span className="font-bold">3. Custo Real da Compra</span>
            <TrendingUp className="h-4 w-4 text-[#16A34A]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#166534] font-mono tracking-tight">
              {formatBRL(custoTotalCompra)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              NF-e ({formatBRL(valorTotalNota)}) + ST ({formatBRL(valorST)})
            </div>
          </div>
        </div>

        {/* Card 4: Composição de Peças */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">4. Composição das Peças</span>
            <span className="font-mono text-[11px] text-slate-700 font-semibold">
              {auditoria.itensAuditados.length} itens
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-700 flex items-center gap-1 font-medium">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Importadas:
              </span>
              <span className="font-mono font-bold text-[#1F2937]">
                {itensImportados.length} itens ({formatBRL(totalSTImportados)})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#166534] flex items-center gap-1 font-medium">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                Nacionais:
              </span>
              <span className="font-mono font-bold text-[#1F2937]">
                {itensNacionais.length} itens ({formatBRL(totalSTNacionais)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Distribuição Visual do Custo da Compra */}
      <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-2/3">
          <span className="text-slate-600 font-semibold shrink-0">Impacto no Custo:</span>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-sky-500 h-full transition-all"
              style={{
                width: `${(valorProdutos / Math.max(custoTotalCompra, 1)) * 100}%`,
              }}
              title={`Produtos: ${formatBRL(valorProdutos)}`}
            />
            <div
              className="bg-[#16A34A] h-full transition-all"
              style={{
                width: `${(valorST / Math.max(custoTotalCompra, 1)) * 100}%`,
              }}
              title={`ICMS-ST: ${formatBRL(valorST)}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] shrink-0 font-medium">
          <span className="flex items-center gap-1.5 text-sky-700">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500 inline-block" />
            Produtos ({((valorProdutos / Math.max(custoTotalCompra, 1)) * 100).toFixed(0)}%)
          </span>
          <span className="flex items-center gap-1.5 text-[#166534]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#16A34A] inline-block" />
            ICMS-ST (+{percentualImpactoST.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
