import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { InconsistenciaXML } from '../types/fiscal';

interface XmlInconsistenciesCardProps {
  inconsistencias: InconsistenciaXML[];
}

export const XmlInconsistenciesCard: React.FC<XmlInconsistenciesCardProps> = ({
  inconsistencias,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (inconsistencias.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 mb-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#DCFCE7] text-[#16A34A]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
              Estrutura do XML: 100% Válida
            </h4>
            <p className="text-xs text-slate-500">
              NCMs, códigos de peças, CSTs e alíquotas auditadas sem inconsistências formais.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-[#166534] bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#16A34A]/30 font-bold">
          CONFORME
        </span>
      </div>
    );
  }

  const erros = inconsistencias.filter((i) => i.tipo === 'ERRO');
  const alertas = inconsistencias.filter((i) => i.tipo === 'ALERTA');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs mb-6">
      <div className="p-5 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1F2937] tracking-tight">
                Alertas da Estrutura do XML ({inconsistencias.length})
              </h3>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {erros.length > 0 ? `${erros.length} Erro(s)` : `${alertas.length} Alerta(s)`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Validações de regras de preenchimento do fornecedor (NCM, CEST, CST)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1F2937] border border-slate-200 text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs"
        >
          <span>{isExpanded ? 'Ocultar Alertas' : 'Exibir Alertas do XML'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-2.5">
          {inconsistencias.map((inc, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                inc.tipo === 'ERRO'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <div className="flex-1">
                <div className="font-bold flex items-center gap-2 text-[#1F2937] mb-0.5">
                  <span>{inc.campo}</span>
                  {inc.itemNumero && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      Item #{inc.itemNumero}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-700">{inc.descricao}</div>
                {inc.sugestao && (
                  <div className="text-[11px] text-amber-900 font-medium mt-1">
                    💡 <strong>Ação:</strong> {inc.sugestao}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
