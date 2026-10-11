import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Printer,
  ArrowRight,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Info,
  Copy
} from 'lucide-react';
import { ResumoAuditoriaNFe, NFeParsed } from '../types/fiscal';

interface ResultSummaryProps {
  auditoria: ResumoAuditoriaNFe;
  nfeParsed: NFeParsed;
  finalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao';
  onChangeFinalidade: (novaFinalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao') => void;
  onForcarSTTodos: (forcar: boolean) => void;
  forcarSTTodosAtivo?: boolean;
  onOpenPrint?: () => void;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  auditoria,
  nfeParsed,
  finalidade,
  onChangeFinalidade,
  onForcarSTTodos,
  forcarSTTodosAtivo,
  onOpenPrint,
}) => {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    if (onOpenPrint) {
      onOpenPrint();
    } else {
      window.print();
    }
  };

  const handleCopySummary = () => {
    const emitenteNome = nfeParsed.emitente.xFant || nfeParsed.emitente.xNome || 'Fornecedor';
    const totalProdutos = nfeParsed.totaisXML.vProd || auditoria.itensAuditados.reduce((acc, it) => acc + it.item.vProd, 0);
    const totalNF = nfeParsed.totaisXML.vNF;
    const icmsST = auditoria.totalARecolher;
    const custoReal = totalNF + icmsST;

    const textToCopy = `MÃO NA RODA — ${emitenteNome}\n🏢 *Regime (XML):* ${nfeParsed.emitente.crtDescricao}\n\n💰 *Valor dos Produtos:* ${formatBRL(totalProdutos)}\n📦 *Valor Total da NF:* ${formatBRL(totalNF)}\n⚖️ *ICMS-ST a Recolher:* ${formatBRL(icmsST)}\n🏁 *CUSTO REAL DA COMPRA:* ${formatBRL(custoReal)}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  };

  // Contagem de classificações
  const countSTRetida = auditoria.itensAuditados.filter((i) => i.classificacao === 'B').length;
  const countSTDevida = auditoria.itensAuditados.filter((i) => i.classificacao === 'C').length;
  const countSTIncerteza = auditoria.itensAuditados.filter((i) => i.classificacao === 'D' || i.classificacao === 'E').length;
  const countSemST = auditoria.itensAuditados.filter((i) => i.classificacao === 'A').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs mb-6">
      {/* Top Banner Status */}
      <div
        className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${
          auditoria.statusGeral === 'CONFIRMADO'
            ? 'bg-[#DCFCE7]/60 border-[#16A34A]/30'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              auditoria.statusGeral === 'CONFIRMADO'
                ? 'bg-[#DCFCE7] text-[#16A34A]'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {auditoria.statusGeral === 'CONFIRMADO' ? (
              <ShieldCheck className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                Determinação Fiscal Oficial
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                  auditoria.statusGeral === 'CONFIRMADO'
                    ? 'bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {auditoria.statusGeral === 'CONFIRMADO'
                  ? 'CÁLCULO CONFIRMADO COM BASE LEGAL'
                  : '⚠️ CÁLCULO NÃO CONFIRMADO'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
              RESULTADO DA NF-e {auditoria.nNF}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            title="Copiar resumo formatado para o WhatsApp"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                <span className="text-[#16A34A]">Resumo Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-[#16A34A]" />
                <span>Copiar Resumo</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs shadow-md shadow-green-500/20 transition-all cursor-pointer"
            title="Abrir e imprimir a folha de memória de cálculo simplificada para anexar à Nota Fiscal"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir Memória de Cálculo</span>
          </button>
        </div>
      </div>

      {/* Safety Warning Block if Not Confirmed */}
      {auditoria.statusGeral === 'NAO_CONFIRMADO' && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 sm:px-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <div className="font-bold text-amber-950 text-sm mb-1">
                REGRA ABSOLUTA DE SEGURANÇA FISCAL: CÁLCULO NÃO CONFIRMADO
              </div>
              <p className="mb-1 text-amber-900">
                Conforme diretriz do Mão na Roda, é rigorosamente vedado apresentar valores como definitivos quando a legislação, o CEST ou o enquadramento do produto apresentar incertezas.
              </p>
              <div className="mt-2 p-2.5 rounded bg-white border border-amber-300 font-mono text-[11px] text-amber-950">
                <strong>O QUE PRECISA SER CONFIRMADO:</strong> {auditoria.motivoGeralNaoConfirmado}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Interactive Toolbar */}
      <div className="bg-[#F8FAFC] border-b border-slate-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#16A34A]" />
          <span className="text-[#1F2937] font-semibold">Finalidade da Aquisição:</span>
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onChangeFinalidade('Revenda')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                finalidade === 'Revenda'
                  ? 'bg-[#16A34A] text-white font-bold'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Revenda (ICMS-ST)
            </button>
            <button
              onClick={() => onChangeFinalidade('UsoConsumo')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                finalidade === 'UsoConsumo'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Uso e Consumo (DIFAL)
            </button>
            <button
              onClick={() => onChangeFinalidade('AtivoImobilizado')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                finalidade === 'AtivoImobilizado'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Ativo Imobilizado (DIFAL)
            </button>
            <button
              onClick={() => onChangeFinalidade('Industrializacao')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                finalidade === 'Industrializacao'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Industrialização
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onForcarSTTodos(!forcarSTTodosAtivo)}
            className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 font-medium ${
              forcarSTTodosAtivo
                ? 'bg-[#DCFCE7] text-[#166534] border-[#16A34A]/40'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Aplica MVA e cálculo de ST a todos os itens da nota"
          >
            <Sliders className="h-3.5 w-3.5 text-[#16A34A]" />
            <span>{forcarSTTodosAtivo ? 'ST Aplicada a Todos (Ativo)' : 'Calcular ST em Todos os Itens'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Data da NF-e + Valores a Recolher */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dados da NF-e e Rota */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Identificação da Operação</span>
              <span className="font-mono text-[#166534]">{auditoria.itensAuditados.length} Itens</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Número da NF-e</span>
                <span className="font-mono font-bold text-[#1F2937] text-sm">{auditoria.nNF}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Série</span>
                <span className="font-mono text-slate-700">{auditoria.serie}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Data de Emissão</span>
                <span className="font-mono text-slate-700">{auditoria.dataEmissao}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Finalidade Tributária</span>
                <span className="font-medium text-[#166534]">{auditoria.finalidadeOperacao}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 text-xs block mb-1">Chave de Acesso:</span>
              <span className="font-mono text-[11px] text-slate-700 bg-white px-2 py-1 rounded block break-all border border-slate-200">
                {auditoria.chaveAcesso || 'Chave não informada no XML'}
              </span>
            </div>
          </div>

          {/* Emitente x Destinatário route */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase tracking-wider">Rota Interestadual</span>
              <div className="flex items-center gap-1 font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {auditoria.ufOrigem}
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30">
                  {auditoria.ufDestino}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-slate-500 text-[11px] flex items-center justify-between mb-1">
                  <span>EMITENTE ({auditoria.ufOrigem}):</span>
                  <span className="font-mono font-bold text-[#166534] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                    {nfeParsed.emitente.crtDescricao}
                  </span>
                </div>
                <div className="font-medium text-[#1F2937] truncate">{nfeParsed.emitente.xNome}</div>
                <div className="font-mono text-slate-500 text-[11px]">CNPJ: {nfeParsed.emitente.cnpj}</div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="text-slate-500 text-[11px] flex items-center justify-between">
                  <span>DESTINATÁRIO ({auditoria.ufDestino}):</span>
                  <span className="font-mono text-slate-700">{nfeParsed.destinatario.indIEDestDescricao}</span>
                </div>
                <div className="font-medium text-[#1F2937] truncate">{nfeParsed.destinatario.xNome}</div>
                <div className="font-mono text-slate-500 text-[11px]">CNPJ: {nfeParsed.destinatario.cnpj}</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700">
              ST Devida: <strong className="text-[#166534]">{countSTDevida} item(ns)</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700">
              ST Já Retida: <strong className="text-[#16A34A]">{countSTRetida} item(ns)</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700">
              Sem ST / Isentos: <strong className="text-slate-500">{countSemST} item(ns)</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700">
              Incerteza (D/E): <strong className="text-rose-600">{countSTIncerteza} item(ns)</strong>
            </div>
          </div>
        </div>

        {/* Right Column: VALORES A RECOLHER */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#F8FAFC] p-5 sm:p-6 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Demonstrativo de Tributos a Recolher pelo Destinatário
              </span>
              <span className="text-xs text-slate-500">Moeda: BRL</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200 text-sm">
                <span className="text-[#1F2937] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                  ICMS-ST a recolher:
                </span>
                <span className="font-mono font-bold text-[#1F2937] text-base">
                  {formatBRL(auditoria.icmsSTaRecolher)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200 text-sm">
                <span className="text-[#1F2937] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-600" />
                  FCP-ST (Fundo de Combate à Pobreza):
                </span>
                <span className="font-mono font-semibold text-slate-700">
                  {formatBRL(auditoria.fcpSTaRecolher)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200 text-sm">
                <span className="text-[#1F2937] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-600" />
                  DIFAL a recolher pelo adquirente:
                </span>
                <span className="font-mono font-semibold text-slate-700">
                  {formatBRL(auditoria.difalARecolher)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200 text-sm">
                <span className="text-[#1F2937] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  IPI de responsabilidade do adquirente:
                </span>
                <span className="font-mono text-slate-500">
                  {formatBRL(auditoria.ipiARecolher)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200 text-sm">
                <span className="text-[#1F2937] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Outros tributos / taxas:
                </span>
                <span className="font-mono text-slate-500">
                  {formatBRL(auditoria.outrosTributos)}
                </span>
              </div>
            </div>

            {/* Informative helper if value is zero */}
            {auditoria.totalARecolher === 0 && (
              <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2 shadow-2xs">
                <Info className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1F2937]">Por que o total a recolher é R$ 0,00?</strong>
                  <p className="text-[11px] mt-0.5 text-slate-500">
                    {countSTRetida > 0
                      ? `Os produtos desta NF-e já tiveram o ICMS-ST retido pelo fornecedor substituto na origem (Classificação B), eximindo o adquirente de novo recolhimento.`
                      : `Os itens importados foram classificados como não sujeitos à ST na UF de destino (${auditoria.ufDestino}). Caso esta mercadoria tenha antecipação obrigatória no seu Estado, use o botão "Calcular ST em Todos os Itens" acima para forçar o cálculo.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* TOTAL A RECOLHER (Primary Highlight) */}
          <div className="mt-6 pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#DCFCE7]/70 p-4 rounded-xl border border-[#16A34A]/40">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#166534] block">
                TOTAL A RECOLHER NESTA OPERAÇÃO
              </span>
              <span className="text-[11px] text-[#166534]/80">
                {auditoria.totalARecolher > 0
                  ? `Recolhimento a ser efetuado via GNRE ou DARE para a SEFAZ/${auditoria.ufDestino}`
                  : 'Nenhum tributo residual de responsabilidade do destinatário'}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl sm:text-3xl font-black text-[#166534] tracking-tight">
                {formatBRL(auditoria.totalARecolher)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
