import React from 'react';
import { Globe, Mail, Sparkles, Printer, RefreshCw, Files, FileSpreadsheet } from 'lucide-react';
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
  unreadCount = 0,
  countdownFormatted,
  isSyncing = false,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5">
            <MaoNaRodaLogo className="h-8.5 w-8.5" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center flex-wrap gap-1.5 leading-none">
                <h1 className="text-sm sm:text-base font-extrabold text-[#1F2937] tracking-tight">
                  MÃO NA <span className="text-[#16A34A]">RODA</span>
                </h1>
                <span aria-hidden="true" className="text-slate-300 text-xs">·</span>
                <span className="text-xs text-slate-600 font-semibold">
                  Inteligência Fiscal em Autopeças
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5 hidden sm:block">
                Use essa ferramenta para lhe ajudar no dia a dia em alguns cálculos complexos
              </p>
            </div>
          </div>

          {/* Atalhos Organizados em Grade Equilibrada */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs self-start md:self-auto">
            {onOpenAutopecasGuide && (
              <button
                onClick={onOpenAutopecasGuide}
                className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 transition-all font-semibold cursor-pointer shadow-2xs active:scale-[0.98]"
                title="Consultar Alíquotas Internas e MVAs dos 27 Estados do Brasil"
              >
                <Globe className="h-3.5 w-3.5 text-[#16A34A] shrink-0" />
                <span>Alíquotas 27 UFs</span>
              </button>
            )}

            <button
              onClick={onOpenRadar}
              className="h-8 relative flex items-center gap-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 transition-all font-semibold cursor-pointer shadow-2xs active:scale-[0.98] group"
              title={`Caixa de Mensagens de Informações Fiscais • Próxima atualização em ${countdownFormatted || '2 horas'}`}
            >
              <div className="relative shrink-0">
                <Mail className="h-3.5 w-3.5 text-[#16A34A]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white">
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
                className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all font-semibold cursor-pointer shadow-2xs active:scale-[0.98]"
                title="Exportador Inteligente de Produtos de NF-e para Cadastro (Excel .xlsx - Padrão 8 Colunas)"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#16A34A] shrink-0" />
                <span>Exportar Produtos (.xlsx)</span>
              </button>
            )}

            {onOpenMassImport && (
              <button
                type="button"
                onClick={onOpenMassImport}
                className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-[#16A34A] hover:bg-[#15803d] text-white font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
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

