import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { ResumoAuditoriaNFe } from '../types/fiscal';

interface AiFiscalAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditoria: ResumoAuditoriaNFe | null;
}

export const AiFiscalAuditModal: React.FC<AiFiscalAuditModalProps> = ({
  isOpen,
  onClose,
  auditoria,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAudit = async (customQ?: string) => {
    const qToSend = customQ !== undefined ? customQ : question;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        nfeData: auditoria ? {
          nNF: auditoria.nNF,
          serie: auditoria.serie,
          dhEmi: auditoria.dataEmissao,
          ufOrigem: auditoria.ufOrigem,
          ufDestino: auditoria.ufDestino,
          finalidade: auditoria.finalidadeOperacao,
          consumidorFinal: auditoria.consumidorFinal ? '1' : '0',
          itens: auditoria.itensAuditados.map(it => ({
            nItem: it.item.nItem,
            xProd: it.item.xProd,
            ncm: it.item.ncm,
            cest: it.item.cest,
            cfop: it.item.cfop,
            vProd: it.item.vProd,
            classificacao: it.classificacaoDescricao,
            totalRecolher: it.totalRecolher,
            mva: it.mva,
            icmsST: it.icmsST,
          })),
        } : null,
        specificQuestion: qToSend,
      };

      const res = await fetch('/api/ai-fiscal-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha na comunicação com o auditor de IA');
      }

      setResponse(data.analysis);
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar a auditoria.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'Qual a base legal para aplicação da MVA Ajustada vs MVA Original nesta rota?',
    'Se esta mercadoria for destinada para Ativo Imobilizado, qual é a regra de DIFAL no estado de destino?',
    'Existe benefício fiscal ou redução de base de cálculo aplicável nesta operação?',
    'Há risco de autuação fiscal pelo posto de fronteira com os dados informados neste XML?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DCFCE7] text-[#16A34A]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1F2937]">
                  PARECER FISCAL AVANÇADO DO AUDITOR (IA)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30">
                  GEMINI 2.5 FLASH
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Análise aprofundada de teses, decretos estaduais específicos e validação de responsabilidade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1F2937] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-700 text-sm">
          {/* Ask Box */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-[#16A34A]" />
              Digite sua dúvida ou selecione uma questão sugerida abaixo:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Qual o impacto da substituição tributária nesta NF-e para o meu CNAE?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAudit()}
                className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-[#1F2937] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
              />
              <button
                onClick={() => handleRunAudit()}
                disabled={loading}
                className="px-6 py-3 bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <span>Analisando...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Consultar IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggested questions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Perguntas Frequentes (Clique para enviar):</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(sq);
                      handleRunAudit(sq);
                    }}
                    className="text-left text-xs bg-[#F8FAFC] hover:bg-[#DCFCE7]/60 text-slate-700 hover:text-[#166534] border border-slate-200 hover:border-[#16A34A]/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {response && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-[#166534]">
                <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                <span>Parecer Técnico do Especialista IA:</span>
              </div>
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
