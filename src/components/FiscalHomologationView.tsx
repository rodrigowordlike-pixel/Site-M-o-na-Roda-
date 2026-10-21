import React, { useState } from 'react';
import { ShieldCheck, Receipt, FileText, CheckCircle2, AlertTriangle, Building2, MapPin, Printer, Copy, Check, Download } from 'lucide-react';
import { ResumoAuditoriaNFe, NFeParsed } from '../types/fiscal';

interface FiscalHomologationViewProps {
  auditoria: ResumoAuditoriaNFe;
  nfeParsed: NFeParsed;
  onOpenPrint: () => void;
  onOpenBordero?: () => void;
  onOpenDanfe?: () => void;
  onDownloadXml?: () => void;
}

export const FiscalHomologationView: React.FC<FiscalHomologationViewProps> = ({
  auditoria,
  nfeParsed,
  onOpenPrint,
  onOpenBordero,
  onOpenDanfe,
  onDownloadXml,
}) => {
  const [copied, setCopied] = useState(false);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  const totalProdutos = nfeParsed.totaisXML.vProd;
  const totalBaseOperacao = auditoria.itensAuditados.reduce(
    (acc, it) => acc + (it.memoriaCalculo?.baseOperacaoPropria || it.item.vProd),
    0
  );
  const totalCreditoICMS = auditoria.itensAuditados.reduce(
    (acc, it) => acc + (it.memoriaCalculo?.icmsProprioDeduzivel || 0),
    0
  );
  const totalBaseST = auditoria.itensAuditados.reduce((acc, it) => acc + it.baseST, 0);
  const totalDebitoSTBruto = auditoria.itensAuditados.reduce(
    (acc, it) => acc + (it.memoriaCalculo?.debitoSTBruto || 0),
    0
  );
  const totalSTLiquido = auditoria.totalARecolher;

  return (
    <div className="space-y-6">
      {/* 1. Card Superior: Dossiê de Homologação e Pagamento da Guia (GNRE / DARE) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                Homologação de ICMS-ST · Guia Oficial
              </span>
              <span className="text-xs text-slate-500 font-mono">
                UF Favorecida: <strong className="text-slate-800">Paraná (PR)</strong> · Alíquota Interna 19,50%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dossiê de Homologação Tributária · NF-e {auditoria.nNF}
            </h2>
          </div>

          {/* Botões de Ação para o Setor Fiscal */}
          <div className="flex items-center flex-wrap gap-2">
            {onOpenDanfe && (
              <button
                onClick={onOpenDanfe}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                title="Visualizar espelho do DANFE oficial"
              >
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Ver DANFE</span>
              </button>
            )}

            {onDownloadXml && (
              <button
                onClick={onDownloadXml}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                title="Baixar arquivo XML da NF-e"
              >
                <Download className="h-4 w-4 text-sky-600" />
                <span>Baixar XML</span>
              </button>
            )}

            {onOpenBordero && (
              <button
                onClick={onOpenBordero}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-[0.98]"
                title="Imprimir borderô direto com Produto x ST para o pagamento da guia"
              >
                <Receipt className="h-4 w-4 text-emerald-200" />
                <span>Imprimir Borderô da ST</span>
              </button>
            )}
          </div>
        </div>

        {/* Banner Informativo quando vST = 0 no XML */}
        {nfeParsed.totaisXML?.vST === 0 && totalSTLiquido > 0 && (
          <div className="mt-4 p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl flex items-start gap-3 text-xs text-amber-950">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-amber-950 text-xs tracking-wide uppercase">
                ⚡ Nota Fiscal Sem Retenção na Origem (vICMSST = R$ 0,00 no XML)
              </span>
              <p className="leading-relaxed text-amber-900">
                O fornecedor <strong>{nfeParsed.emitente.xNome}</strong> ({nfeParsed.emitente.uf}) faturou sem ST retida na nota. O sistema apurou a <strong>Antecipação Tributária do ICMS-ST na Entrada ({formatBRL(totalSTLiquido)})</strong> a ser recolhida via guia (GNRE/DARE) no Paraná.
              </p>
            </div>
          </div>
        )}

        {/* Informações da Guia de Recolhimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-5">
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Obrigação Tributária</div>
            <div className="text-lg font-black text-slate-900">ICMS Substituição Tributária</div>
            <div className="text-xs text-emerald-800 font-mono mt-1 font-bold">Antecipação na Entrada (PR)</div>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Enquadramento Legal</div>
            <div className="text-lg font-black text-slate-900">Protocolo ICMS 41/2008</div>
            <div className="text-xs text-slate-500 font-mono mt-1">Lei Estadual nº 21.850/PR</div>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Crédito Próprio Deduzido</div>
            <div className="text-2xl font-black text-sky-700 font-mono tabular-nums">{formatBRL(totalCreditoICMS)}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Operação Própria (4% ou 12%)</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-300/80 rounded-2xl p-5 shadow-xs">
            <div className="text-[11px] text-emerald-900 font-bold uppercase tracking-wider mb-1">Valor Líquido da Guia</div>
            <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-emerald-800 font-mono tabular-nums tracking-tight">
              {formatBRL(totalSTLiquido)}
            </div>
            <div className="text-xs text-emerald-800 mt-1 font-bold">Recolhimento Destinatário</div>
          </div>
        </div>
      </div>

      {/* Dual Column Layout no Desktop: Dossiê de Pagamento na Esquerda & Escada Tributária na Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda (7 cols): Dossiê da Guia e Participantes */}
        <div className="col-span-12 lg:col-span-7 space-y-5">
          {/* Card Dossiê para Emissão da Guia */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Parâmetros Oficiais para Emissão da Guia (GNRE / DARE)</h3>
                  <p className="text-[11px] text-slate-500">Dados cadastrais exigidos pelo portal SEFAZ-PR / Receita Estadual</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-800 border border-slate-200">
                Código: 10008-0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Favorecido / UF</span>
                <span className="font-bold text-slate-900 text-sm">Estado do Paraná (SEFAZ-PR)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Código de Receita Oficial</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">10008-0 (ICMS-ST Operação)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Documento de Origem</span>
                <span className="font-mono font-bold text-slate-900 text-sm">NF-e {auditoria.nNF} (Série {auditoria.serie})</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Vencimento Recomendado</span>
                <span className="font-bold text-slate-900 text-sm">Na entrada no Estado do PR</span>
              </div>
            </div>

            {/* Chave de Acesso Completa Copiável */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="font-mono text-[11px] text-slate-700 break-all select-all">
                {auditoria.chaveAcesso}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(auditoria.chaveAcesso);
                }}
                className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold text-xs cursor-pointer shadow-2xs transition-all active:scale-[0.98]"
              >
                Copiar Chave
              </button>
            </div>
          </div>

          {/* Dados dos Participantes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2.5">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Remetente / Fornecedor (Origem)
              </div>
              <div className="text-sm font-bold text-slate-900 mb-1 truncate" title={nfeParsed.emitente.xNome}>
                {nfeParsed.emitente.xNome}
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>CNPJ: <span className="font-semibold text-slate-900">{nfeParsed.emitente.cnpj}</span></div>
                <div>Inscrição Estadual: <span className="font-semibold text-slate-900">{nfeParsed.emitente.ie || 'Isento'}</span></div>
                <div>UF Origem: <span className="text-emerald-700 font-bold">{nfeParsed.emitente.uf}</span> · {nfeParsed.emitente.crtDescricao}</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2.5">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Destinatário / Adquirente (Destino)
              </div>
              <div className="text-sm font-bold text-slate-900 mb-1 truncate" title={nfeParsed.destinatario.xNome}>
                {nfeParsed.destinatario.xNome}
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>CNPJ: <span className="font-semibold text-slate-900">{nfeParsed.destinatario.cnpj}</span></div>
                <div>Inscrição Estadual: <span className="font-semibold text-slate-900">{nfeParsed.destinatario.ie || 'Não informada'}</span></div>
                <div>UF Destino: <span className="text-emerald-700 font-bold">{nfeParsed.destinatario.uf}</span> · {nfeParsed.destinatario.indIEDestDescricao}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita (5 cols): Escada Tributária Passo a Passo */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Escada de Cálculo da ST</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
              RICMS/PR 19,5%
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Passo 1 */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">1. Base Própria da Operação</span>
                <span className="text-slate-700 text-xs">Valor Produtos + IPI/Frete</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                {formatBRL(totalBaseOperacao)}
              </span>
            </div>

            {/* Passo 2 */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">2. Base de Cálculo da ST</span>
                <span className="text-slate-700 text-xs">Com MVA oficial aplicada</span>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-sm tabular-nums">
                {formatBRL(totalBaseST)}
              </span>
            </div>

            {/* Passo 3 */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">3. Débito Bruto Estadual</span>
                <span className="text-slate-700 text-xs">Alíquota Interna PR 19,50%</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                {formatBRL(totalDebitoSTBruto)}
              </span>
            </div>

            {/* Passo 4 */}
            <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-900 block">4. Crédito Próprio Deduzido (-)</span>
                <span className="text-sky-800 text-xs">Destaque na NF (4% ou 12%)</span>
              </div>
              <span className="font-mono font-bold text-sky-800 text-sm tabular-nums">
                - {formatBRL(totalCreditoICMS)}
              </span>
            </div>

            {/* Passo 5: Resultado Final */}
            <div className="p-4 bg-emerald-100/70 rounded-xl border border-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-black text-emerald-950 block">5. ICMS-ST Líquido da Guia (=)</span>
                <span className="text-emerald-900 text-xs font-semibold">Valor final para recolhimento</span>
              </div>
              <span className="font-mono font-black text-emerald-950 text-xl tabular-nums">
                {formatBRL(totalSTLiquido)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> Homologado RICMS/PR
            </span>
            <span className="font-mono">{auditoria.itensAuditados.length} itens conferidos</span>
          </div>
        </div>
      </div>

      {/* 3. Certificado de Homologação e Conformidade Fiscal */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Certificado de Conformidade Fiscal & Dupla Validação Algorítmica
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Todos os {auditoria.itensAuditados.length} itens foram submetidos a 22 etapas de conferência de acordo com as regras de autopeças do Paraná (104,86% Importados · 87,78% Nacionais).
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-300 font-bold shrink-0 self-start sm:self-auto">
          HOMOLOGADO SEFAZ-PR
        </span>
      </div>
    </div>
  );
};
