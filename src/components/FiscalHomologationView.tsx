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
      {/* 1. Card Superior: Dados para Emissão e Pagamento da Guia (GNRE / DARE) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                Homologação de ICMS-ST para Pagamento
              </span>
              <span className="text-xs text-slate-500 font-mono">
                UF Favorecida: <strong>Paraná (PR)</strong> · Alíquota Interna 19,50%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1F2937] tracking-tight">
              Dossiê de Homologação Tributária · NF-e {auditoria.nNF}
            </h2>
          </div>

          {/* Botões de Ação para o Setor Fiscal */}
          <div className="flex items-center flex-wrap gap-2">
            {onOpenDanfe && (
              <button
                onClick={onOpenDanfe}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Visualizar espelho do DANFE oficial"
              >
                <FileText className="h-4 w-4 text-[#16A34A]" />
                <span>Ver DANFE</span>
              </button>
            )}

            {onDownloadXml && (
              <button
                onClick={onDownloadXml}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Baixar arquivo XML da NF-e"
              >
                <Download className="h-4 w-4 text-sky-600" />
                <span>Baixar XML</span>
              </button>
            )}

            {onOpenBordero && (
              <button
                onClick={onOpenBordero}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs shadow-md shadow-green-500/20 transition-all cursor-pointer"
                title="Imprimir borderô direto com Produto x ST para o pagamento da guia"
              >
                <Receipt className="h-4 w-4 text-[#DCFCE7]" />
                <span>Imprimir Borderô da ST a Pagar</span>
              </button>
            )}
          </div>
        </div>

        {/* Banner Informativo quando vST = 0 no XML */}
        {nfeParsed.totaisXML?.vST === 0 && totalSTLiquido > 0 && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950 text-xs">
                ⚡ NOTA EMITIDA PELO FORNECEDOR SEM RETENÇÃO NA ORIGEM (vICMSST = R$ 0,00 NO XML)
              </span>
              <span>
                O fornecedor <strong>{nfeParsed.emitente.xNome}</strong> ({nfeParsed.emitente.uf}) não reteve a ST no XML. A ferramenta efetuou o cálculo da <strong>Antecipação Tributária do ICMS-ST na Entrada ({formatBRL(totalSTLiquido)})</strong> a ser recolhida via guia (GNRE/DARE) no estado de destino ({nfeParsed.destinatario.uf}).
              </span>
            </div>
          </div>
        )}

        {/* Informações da Guia de Recolhimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-5">
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">Tributo / Obrigação</div>
            <div className="text-base font-bold text-[#1F2937]">ICMS Substituição Tributária</div>
            <div className="text-[11px] text-[#166534] font-mono mt-1">Antecipação na Entrada</div>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">Enquadramento Legal</div>
            <div className="text-base font-bold text-[#1F2937]">Protocolo ICMS 41/2008</div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Lei Estadual nº 21.850/PR</div>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">Crédito de ICMS Deduzido</div>
            <div className="text-xl font-bold text-sky-700 font-mono">{formatBRL(totalCreditoICMS)}</div>
            <div className="text-[11px] text-slate-500 mt-1">Operação Própria (4% / 12%)</div>
          </div>

          <div className="bg-[#DCFCE7]/70 border border-[#16A34A]/40 rounded-xl p-4">
            <div className="text-xs text-[#166534] font-bold mb-1">Valor Principal da Guia</div>
            <div className="text-2xl sm:text-3xl font-black text-[#166534] font-mono tracking-tight">
              {formatBRL(totalSTLiquido)}
            </div>
            <div className="text-[11px] text-[#166534]/80 mt-1">Valor Líquido a Recolher</div>
          </div>
        </div>

        {/* Quadro Consolidado da Apuração Fiscal */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 sm:p-5 mt-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Quadro Consolidado de Apuração Fiscal (Memória Geral da Nota)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px]">1. Base Operação Própria</div>
              <div className="font-mono font-bold text-[#1F2937] text-sm mt-1">{formatBRL(totalBaseOperacao)}</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px]">2. Base Total de ICMS-ST</div>
              <div className="font-mono font-bold text-[#166534] text-sm mt-1">{formatBRL(totalBaseST)}</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px]">3. Débito Bruto ST (19,5%)</div>
              <div className="font-mono font-bold text-[#1F2937] text-sm mt-1">{formatBRL(totalDebitoSTBruto)}</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px]">4. Crédito ICMS Próprio (-)</div>
              <div className="font-mono font-bold text-sky-700 text-sm mt-1">{formatBRL(totalCreditoICMS)}</div>
            </div>

            <div className="p-3 bg-[#DCFCE7] rounded-lg border border-[#16A34A]/30 col-span-2 sm:col-span-1">
              <div className="text-[#166534] text-[11px] font-bold">5. ICMS-ST Líquido (=)</div>
              <div className="font-mono font-black text-[#166534] text-base mt-1">{formatBRL(totalSTLiquido)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dados dos Participantes e Rota da Mercadoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="h-4 w-4 text-[#16A34A]" />
            Remetente / Fornecedor (Origem)
          </div>
          <div className="text-sm font-bold text-[#1F2937] mb-1">{nfeParsed.emitente.xNome}</div>
          <div className="text-xs text-slate-600 space-y-1 font-mono">
            <div>CNPJ: {nfeParsed.emitente.cnpj}</div>
            <div>Inscrição Estadual: {nfeParsed.emitente.ie || 'Isento'}</div>
            <div>UF de Origem: <span className="text-[#166534] font-bold">{nfeParsed.emitente.uf}</span> · Regime: {nfeParsed.emitente.crtDescricao}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="h-4 w-4 text-[#16A34A]" />
            Destinatário / Adquirente (Destino)
          </div>
          <div className="text-sm font-bold text-[#1F2937] mb-1">{nfeParsed.destinatario.xNome}</div>
          <div className="text-xs text-slate-600 space-y-1 font-mono">
            <div>CNPJ: {nfeParsed.destinatario.cnpj}</div>
            <div>Inscrição Estadual: {nfeParsed.destinatario.ie || 'Não informada'}</div>
            <div>UF de Destino: <span className="text-[#166534] font-bold">{nfeParsed.destinatario.uf}</span> · {nfeParsed.destinatario.indIEDestDescricao}</div>
          </div>
        </div>
      </div>

      {/* 3. Certificado de Homologação e Conformidade Fiscal */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#DCFCE7] text-[#16A34A] shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1F2937]">
              Certificado de Conformidade Fiscal & Dupla Validação
            </h4>
            <p className="text-xs text-slate-500">
              Todos os {auditoria.itensAuditados.length} itens foram submetidos a 22 etapas de conferência de acordo com as regras de autopeças do Paraná (104,86% Importados · 87,78% Nacionais).
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-[#166534] bg-[#DCFCE7] px-3 py-1.5 rounded-xl border border-[#16A34A]/30 font-bold shrink-0">
          STATUS: HOMOLOGADO
        </span>
      </div>
    </div>
  );
};
