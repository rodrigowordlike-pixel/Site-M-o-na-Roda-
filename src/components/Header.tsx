import React from 'react';
import { Car, Globe, Mail, Sparkles, Printer, RefreshCw } from 'lucide-react';
import { ResumoAuditoriaNFe } from '../types/fiscal';

interface HeaderProps {
  auditoria?: ResumoAuditoriaNFe | null;
  onOpenRadar: () => void;
  onOpenLegis: () => void;
  onOpenAiAudit: () => void;
  onOpenPrint?: () => void;
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
  onOpenAutopecasGuide,
  unreadCount = 0,
  countdownFormatted,
  isSyncing = false,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-40 backdrop-blur-xl shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#166534] via-[#16A34A] to-emerald-400 flex items-center justify-center text-white font-black shadow-md shadow-emerald-500/20 shrink-0">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-black text-[#1F2937] tracking-tight">
                  MÃO NA <span className="text-[#16A34A]">RODA</span>
                </h1>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs text-slate-600 font-medium tracking-wide">
                  Inteligência Fiscal em Autopeças Brasil
                </span>
                <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                <span className="text-xs text-[#166534] font-mono font-bold hidden sm:inline-block bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                  Desenvolvido por Rodrigo Narciso
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                Use essa ferramenta para lhe ajudar no dia a dia em alguns cálculos complexos
              </p>
            </div>
          </div>

          {/* Action and Utility Buttons */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {onOpenAutopecasGuide && (
              <button
                onClick={onOpenAutopecasGuide}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 transition-all font-semibold cursor-pointer shadow-xs"
                title="Consultar Alíquotas Internas e MVAs dos 27 Estados do Brasil"
              >
                <Globe className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Alíquotas 27 UFs</span>
              </button>
            )}

            <button
              onClick={onOpenRadar}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 transition-all font-medium cursor-pointer shadow-xs group"
              title={`Caixa de Mensagens do Radar Fiscal (TOP 10 Autopeças) • Próxima atualização em ${countdownFormatted || '2 horas'}`}
            >
              <div className="relative shrink-0">
                <Mail className="h-4 w-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#1F2937]">Radar Fiscal</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-ping" title="Sincronização Ativa a cada 2 horas"></span>
                </div>
                {countdownFormatted && (
                  <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                    {isSyncing ? (
                      <RefreshCw className="h-2.5 w-2.5 animate-spin text-[#16A34A]" />
                    ) : null}
                    2h: {countdownFormatted}
                  </span>
                )}
              </div>
            </button>

            {onOpenPrint && (
              <button
                onClick={onOpenPrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#166534] border border-[#16A34A]/30 font-bold transition-all cursor-pointer shadow-xs"
                title="Imprimir Relatório Detalhado para a Nota Fiscal"
              >
                <Printer className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Imprimir Relatório</span>
              </button>
            )}

            <button
              onClick={onOpenAiAudit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold shadow-md shadow-green-500/20 transition-all cursor-pointer"
              title="Consultor Fiscal com Inteligência Artificial"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#DCFCE7]" />
              <span>Consultor IA</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

