import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, X } from 'lucide-react';
import { MaoNaRodaLogo } from './MaoNaRodaLogo';

interface LoadingGameOverlayProps {
  isLoading: boolean;
  onComplete: () => void;
}

export const LoadingGameOverlay: React.FC<LoadingGameOverlayProps> = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showFinished, setShowFinished] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setShowFinished(false);
      return;
    }

    setProgress(15);
    setShowFinished(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowFinished(true);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 20) + 15;
        return next > 100 ? 100 : next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading && !showFinished) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Botão de Fechar / Concluir */}
        {showFinished && (
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 text-slate-400 hover:text-[#1F2937] bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors border border-slate-200 shadow-2xs cursor-pointer"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="relative mx-auto flex items-center justify-center">
          <MaoNaRodaLogo className="h-16 w-16 shadow-lg" />
          {progress < 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-white drop-shadow-md" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-[#166534] font-mono font-bold flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
            Mão na Roda · Auditoria Fiscal
          </div>
          <h3 className="text-2xl font-black text-[#1F2937]">
            {progress < 100 ? `Processando cálculo... ${progress}%` : 'Cálculo Concluído!'}
          </h3>
          <p className="text-xs text-slate-500">
            {progress < 100
              ? 'Validando MVAs, alíquotas estaduais e Convênio 142/2018...'
              : 'Auditoria tributária realizada com sucesso. Clique abaixo para visualizar o relatório.'}
          </p>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200">
          <div
            className="bg-[#16A34A] h-full rounded-full transition-all duration-150 shadow-md shadow-green-500/20"
            style={{ width: `${progress}%` }}
          />
        </div>

        {showFinished ? (
          <button
            onClick={onComplete}
            className="w-full py-3.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-green-500/20 transition-all cursor-pointer"
          >
            <span>Ver Resultado da Auditoria</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono">
            Aguarde um instante...
          </div>
        )}
      </div>
    </div>
  );
};
