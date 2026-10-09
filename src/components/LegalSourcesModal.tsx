import React from 'react';
import { X, ExternalLink, ShieldCheck, Scale, Globe } from 'lucide-react';
import { TABELA_UFS } from '../data/fiscalTaxDatabase';
import { UF } from '../types/fiscal';

interface LegalSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalSourcesModal: React.FC<LegalSourcesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const fontesOficiaisPrincipais = [
    {
      hierarquia: '1º Lugar',
      categoria: 'Legislação Oficial Federal',
      titulo: 'Constituição Federal de 1988 (Art. 155, § 2º)',
      descricao: 'Competência tributária dos estados para instituição do ICMS, Substituição Tributária e partilha de DIFAL.',
      link: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
    },
    {
      hierarquia: '2º Lugar',
      categoria: 'Legislação Complementar Federal',
      titulo: 'Lei Complementar nº 87/1996 (Lei Kandir)',
      descricao: 'Normas gerais de ICMS, regime de substituição tributária (arts. 6º a 10) e fixação da base de cálculo.',
      link: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
    },
    {
      hierarquia: '3º Lugar',
      categoria: 'Legislação Complementar Federal',
      titulo: 'Lei Complementar nº 190/2022 (DIFAL Nacional)',
      descricao: 'Regulamenta o Diferencial de Alíquotas nas operações e prestações interestaduais a consumidor final.',
      link: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp190.htm',
    },
    {
      hierarquia: '4º Lugar',
      categoria: 'CONFAZ - Regime Geral de ST',
      titulo: 'Convênio ICMS nº 142/2018',
      descricao: 'Dispõe sobre os regimes de substituição tributária e de antecipação de recolhimento do ICMS, critérios de MVA ajustada e relação de mercadorias nos Anexos I a XXVI.',
      link: 'https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/cv142_18',
    },
    {
      hierarquia: '5º Lugar',
      categoria: 'Receita Federal do Brasil',
      titulo: 'Tabela TIPI (Nomenclatura Comum do Mercosul - NCM)',
      descricao: 'Classificação fiscal de mercadorias, alíquotas de IPI e conformidade do código NCM.',
      link: 'https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/tabela-tipi',
    },
    {
      hierarquia: '6º Lugar',
      categoria: 'Portal Nacional da NF-e',
      titulo: 'Documentos Técnicos e Notas Técnicas NF-e',
      descricao: 'Regras de validação de schemas XML, regras de rejeição de campos fiscais e CFOPs oficiais.',
      link: 'https://www.nfe.fazenda.gov.br',
    },
  ];

  const ufsList = Object.keys(TABELA_UFS) as UF[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DCFCE7] text-[#16A34A]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F2937]">
                HIERARQUIA OFICIAL DE FONTES DE LEGISLAÇÃO TRIBUTÁRIA
              </h3>
              <p className="text-xs text-slate-500">
                Fontes oficiais primárias de consulta: Planalto, CONFAZ, Receita Federal e as 27 Secretarias de Fazenda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1F2937] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Priority Hierarchy Rules */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-[#1F2937] uppercase tracking-wider text-[11px]">
              Ordem de Prioridade Obrigatória para Determinação do Recolhimento:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 font-mono text-[11px]">
              <li>Legislação oficial federal (Constituição Federal, Leis Complementares);</li>
              <li>CONFAZ (Convênios ICMS, Protocolos ICMS, Ajustes SINIEF, Atos COTEPE);</li>
              <li>Receita Federal do Brasil (Tabela TIPI, Soluções de Consulta COSIT);</li>
              <li>Legislação Estadual do Destinatário (Lei Estadual do PR nº 21.850/2023, RICMS/PR, Decretos Estaduais);</li>
              <li>Nota Técnica do Portal Nacional da NF-e.</li>
            </ol>
          </div>

          {/* Main Legal Sources Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1F2937] uppercase tracking-wider text-xs border-b border-slate-200 pb-2">
              Principais Fontes e Portais Oficiais Validados
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fontesOficiaisPrincipais.map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-[#16A34A]/50 transition-colors flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#166534] font-bold">
                      <span className="px-2 py-0.5 rounded bg-[#DCFCE7]">{f.hierarquia}</span>
                      <span className="text-slate-500">{f.categoria}</span>
                    </div>
                    <div className="text-sm font-bold text-[#1F2937]">{f.titulo}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.descricao}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <a
                      href={f.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] hover:text-[#15803d]"
                    >
                      <span>Acessar Portal Oficial</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 27 UFs Portal State Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1F2937] uppercase tracking-wider text-xs border-b border-slate-200 pb-2">
              Portais das Secretarias de Fazenda (SEFAZ 27 UFs)
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {ufsList.map((uf) => {
                const info = TABELA_UFS[uf];
                return (
                  <a
                    key={uf}
                    href={info.ricmsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#DCFCE7]/60 border border-slate-200 hover:border-[#16A34A]/40 text-center transition-colors block group"
                  >
                    <div className="font-bold text-xs text-[#1F2937] group-hover:text-[#166534] font-mono">{uf}</div>
                    <div className="text-[10px] text-slate-500 truncate">{info.nome}</div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
