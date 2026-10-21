import React from 'react';
import { Globe, Mail, Sparkles, Printer, RefreshCw, Files, FileSpreadsheet, HelpCircle } from 'lucide-react';
import { MaoNaRodaLogo } from './MaoNaRodaLogo';
import { ResumoAuditoriaNFe } from '../types/fiscal';

interface HeaderProps {
  auditoria?: ResumoAuditoriaNFe | null;
  onOpenRadar: () => void;
  onOpenLegis: () => void;
  onOpenAiAudit?: () => void;
  onOpenPrint?: () => void;
  onOpenMassImport?: () => void;
  onOpenProductExport?: () => void;
  onOpenAutopecasGuide?: () => void;
  onOpenLanding?: () => void;
  unreadCount?: number;
  countdownFormatted?: string;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  auditoria,
  onOpenRadar,
  onOpenLegis,
  onOpenAiAudit,
  onOpenPrint,
  onOpenMassImport,
  onOpenProductExport,
  onOpenAutopecasGuide,
  onOpenLanding,
  unreadCount = 0,
  countdownFormatted,
  isSyncing = false,
}) => {
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1640px] 2xl:max-w-[1760px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Corporate Branding */}
          <div
            onClick={onOpenLanding}
            className={`flex items-center gap-3 ${onOpenLanding ? 'cursor-pointer group' : ''}`}
            title={onOpenLanding ? 'Clique para ver a apresentação da ferramenta' : undefined}
          >
            <MaoNaRodaLogo className="h-10 w-10 shadow-sm transition-transform group-hover:scale-105" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center flex-wrap gap-2 leading-none">
                <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>MÃO NA <span className="text-emerald-600">RODA</span></span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-slate-900 text-emerald-400 border border-emerald-500/30">
                    ENTERPRISE
                  </span>
                </h1>
                <span aria-hidden="true" className="text-slate-300 text-xs hidden sm:inline">·</span>
                <span className="text-xs lg:text-sm text-slate-600 font-semibold hidden sm:inline">
                  Inteligência Fiscal & Auditoria de NF-e
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
                  Ambiente Homologado · RICMS/PR (Lei 21.850/2023)
                </span>
                <span className="hidden xl:inline text-slate-300">|</span>
                <span className="hidden xl:inline text-slate-500 font-mono text-[10px]">
                  Protocolo ICMS 41/2008 · Autopeças 27 UFs
                </span>
              </div>
            </div>
          </div>

          {/* Atalhos Executivos de Alta Produtividade */}
          <div className="flex items-center flex-wrap gap-2 text-xs self-start md:self-auto">
            {onOpenAutopecasGuide && (
              <button
                onClick={onOpenAutopecasGuide}
                className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 hover:border-slate-300 transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
                title="Consultar Alíquotas Internas e MVAs dos 27 Estados do Brasil"
              >
                <Globe className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Alíquotas 27 UFs</span>
              </button>
            )}

            <button
              onClick={onOpenRadar}
              className="h-8.5 relative flex items-center gap-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 hover:border-slate-300 transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] group"
              title={`Caixa de Mensagens de Informações Fiscais • Próxima atualização em ${countdownFormatted || '2 horas'}`}
            >
              <div className="relative shrink-0">
                <Mail className="h-3.5 w-3.5 text-emerald-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>Informações Fiscais</span>
              {countdownFormatted && (
                <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">
                  ({countdownFormatted})
                </span>
              )}
            </button>

            {onOpenProductExport && (
              <button
                type="button"
                onClick={onOpenProductExport}
                className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 hover:border-emerald-300 transition-all font-semibold cursor-pointer shadow-2xs active:scale-[0.98]"
                title="Exportador Inteligente de Produtos de NF-e para Cadastro (Excel .xlsx - Padrão 8 Colunas)"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Exportar Produtos (.xlsx)</span>
              </button>
            )}

            {onOpenLanding && (
              <button
                type="button"
                onClick={onOpenLanding}
                className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 hover:border-slate-300 transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
                title="Conhecer a ferramenta e ver a apresentação inicial"
              >
                <HelpCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Sobre a Ferramenta</span>
              </button>
            )}

            {onOpenMassImport && (
              <button
                type="button"
                onClick={onOpenMassImport}
                className="h-8.5 flex items-center gap-1.5 px-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold transition-all cursor-pointer shadow-xs hover:shadow-sm active:scale-[0.98]"
                title="Importar múltiplos arquivos XML de NF-e para cálculo em massa"
              >
                <Files className="h-3.5 w-3.5 text-white shrink-0" />
                <span>Importar em Massa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

