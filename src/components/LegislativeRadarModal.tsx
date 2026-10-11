import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  ExternalLink,
  Filter,
  RefreshCw,
  Mail,
  MailOpen,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Radio,
  Sparkles,
  ShieldAlert,
  Car,
  FileText
} from 'lucide-react';
import { AlteracaoTributariaRadar, UF } from '../types/fiscal';

interface LegislativeRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  ufDestaque?: UF;
  alteracoes: AlteracaoTributariaRadar[];
  readIds: string[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  markAllAsUnread: () => void;
  lastSyncDateFormatted: string;
  countdownFormatted: string;
  isSyncing: boolean;
  syncNow: () => void;
  lastSyncStatusMessage: string | null;
  currentYear?: number;
  somenteAnoAtual?: boolean;
  setSomenteAnoAtual?: (val: boolean) => void;
  totalAnoAtual?: number;
}

export const LegislativeRadarModal: React.FC<LegislativeRadarModalProps> = ({
  isOpen,
  onClose,
  ufDestaque,
  alteracoes,
  readIds,
  unreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  markAllAsUnread,
  lastSyncDateFormatted,
  countdownFormatted,
  isSyncing,
  syncNow,
  lastSyncStatusMessage,
  currentYear = new Date().getFullYear(),
  somenteAnoAtual = true,
  setSomenteAnoAtual,
  totalAnoAtual,
}) => {
  const [filtroUF, setFiltroUF] = useState<string>(ufDestaque || 'TODAS');
  const [abaAtiva, setAbaAtiva] = useState<'TODAS' | 'NAO_LIDAS' | 'CRITICAS'>('TODAS');
  const [expandedId, setExpandedId] = useState<string | null>(alteracoes[0]?.id || null);

  if (!isOpen) return null;

  const alteracoesFiltradas = alteracoes.filter((alt) => {
    const isRead = readIds.includes(alt.id);
    if (abaAtiva === 'NAO_LIDAS' && isRead) return false;
    if (abaAtiva === 'CRITICAS' && alt.urgencia !== 'CRITICA') return false;

    if (filtroUF === 'TODAS') return true;
    return alt.ufAfetada === filtroUF || alt.ufAfetada === 'TODAS' || alt.ufAfetada === 'CONFAZ';
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
    if (!readIds.includes(id)) {
      markAsRead(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col my-auto">
        
        {/* Top Header estilo Caixa de Mensagens */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-[#F8FAFC] sticky top-0 z-20">
          <div className="flex items-start sm:items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/30 shrink-0">
                <Mail className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-black text-[#1F2937] tracking-tight">
                    CAIXA DE MENSAGENS · INFORMAÇÕES FISCAIS
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30 font-mono">
                    ANO ATUAL {currentYear}: {alteracoesFiltradas.length} {alteracoesFiltradas.length === 1 ? 'MUDANÇA' : 'MUDANÇAS'}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-ping"></span>
                    Varredura a cada 2h
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoramento contínuo das Portarias SEFAZ, Convênios CONFAZ e Diário Oficial da União no setor automotivo
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1F2937] transition-colors shrink-0 cursor-pointer"
              title="Fechar Caixa de Mensagens"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Barra de Sincronização Automática a cada 2 horas */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center flex-wrap gap-3 text-slate-600">
              <div className="flex items-center gap-1.5 text-[#166534] font-medium">
                <Radio className="h-3.5 w-3.5 animate-pulse text-[#16A34A]" />
                <span>Radar Ativo</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Última checagem: <strong className="text-[#1F2937]">{lastSyncDateFormatted}</strong></span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>Próxima atualização em:</span>
                <span className="font-mono font-bold text-[#166534] bg-[#DCFCE7] px-1.5 py-0.5 rounded border border-[#16A34A]/30">
                  {countdownFormatted}
                </span>
              </div>
            </div>

            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#1F2937] border border-slate-200 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Forçar verificação imediata dos Diários Oficiais e SEFAZ"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#16A34A] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Verificando Diários...' : 'Verificar Agora'}</span>
            </button>
          </div>

          {lastSyncStatusMessage && (
            <div className="mt-2 text-[11px] text-[#166534] bg-[#DCFCE7] border border-[#16A34A]/30 px-3 py-1.5 rounded-lg animate-fadeIn flex items-center gap-2 font-mono">
              <span>✓</span>
              <span>{lastSyncStatusMessage}</span>
            </div>
          )}
        </div>

        {/* Guidance Banner */}
        <div className="bg-[#DCFCE7]/60 border-b border-[#16A34A]/20 p-3.5 px-6 text-xs text-[#166534]">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4.5 w-4.5 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#166534] text-xs uppercase tracking-wide mr-2">
                Publicações do Ano Atual ({currentYear}):
              </span>
              <span className="text-slate-700">
                Exibindo as <strong>{alteracoesFiltradas.length}</strong> publicações e normas oficiais vigentes do <strong>ano atual ({currentYear})</strong> para o setor de autopeças.
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Navigation Tabs */}
        <div className="p-3 sm:p-4 px-6 border-b border-slate-200 bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setAbaAtiva('TODAS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                abaAtiva === 'TODAS'
                  ? 'bg-[#16A34A] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Todas ({alteracoes.length})
            </button>
            <button
              onClick={() => setAbaAtiva('NAO_LIDAS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                abaAtiva === 'NAO_LIDAS'
                  ? 'bg-[#16A34A] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              <span>Não Lidas</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setAbaAtiva('CRITICAS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                abaAtiva === 'CRITICAS'
                  ? 'bg-[#16A34A] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Críticas / Urgentes
            </button>
          </div>

          {/* Action buttons & Jurisdiction Filter */}
          <div className="flex items-center flex-wrap gap-2.5">
            {setSomenteAnoAtual && (
              <button
                type="button"
                onClick={() => setSomenteAnoAtual(!somenteAnoAtual)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                  somenteAnoAtual
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#16A34A]/30'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-[#1F2937]'
                }`}
                title="Alternar entre apenas ano atual ou todas as publicações"
              >
                <span>🗓️ Ano {currentYear} {somenteAnoAtual ? '(Ativo)' : '(Todos Anos)'}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
              <Filter className="h-3 w-3 text-slate-400" />
              <span className="text-slate-500 text-[11px]">UF:</span>
              <select
                value={filtroUF}
                onChange={(e) => setFiltroUF(e.target.value)}
                className="bg-transparent text-[#1F2937] text-xs focus:outline-none font-mono cursor-pointer"
              >
                <option value="TODAS">Todas UFs</option>
                <option value="PR">Paraná (PR)</option>
                <option value="SP">São Paulo (SP)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="RS">Rio Grande do Sul (RS)</option>
                <option value="SC">Santa Catarina (SC)</option>
                <option value="BA">Bahia (BA)</option>
                <option value="CONFAZ">CONFAZ / Nacional</option>
              </select>
            </div>

            {unreadCount > 0 ? (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1F2937] text-[11px] font-medium transition-colors cursor-pointer"
                title="Marcar todas as mensagens como lidas"
              >
                <CheckCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Marcar lidas</span>
              </button>
            ) : (
              <button
                onClick={() => markAllAsUnread()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer"
                title="Marcar todas como não lidas"
              >
                <Mail className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Resetar lidas</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Feed / List */}
        <div className="p-4 sm:p-6 space-y-3.5 flex-1 bg-white">
          {alteracoesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <MailOpen className="h-10 w-10 mx-auto text-slate-400 opacity-50" />
              <p className="font-medium text-slate-700">Nenhuma mensagem nesta categoria.</p>
              <p className="text-xs text-slate-500">Selecione outra aba ou limpe o filtro por UF.</p>
            </div>
          ) : (
            alteracoesFiltradas.map((alt) => {
              const isRead = readIds.includes(alt.id);
              const isExpanded = expandedId === alt.id;

              return (
                <div
                  key={alt.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    !isRead
                      ? 'bg-[#F8FAFC] border-[#16A34A]/40 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header estilo Mensagem da Caixa de Entrada */}
                  <div
                    onClick={() => toggleExpand(alt.id)}
                    className="p-3.5 sm:p-4 cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Status indicator icon */}
                      <div className="mt-0.5 shrink-0">
                        {!isRead ? (
                          <div className="h-3 w-3 rounded-full bg-[#16A34A] shadow-md shadow-green-500/50 ring-4 ring-green-100" title="Mensagem Nova (Não Lida)" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-slate-300" title="Mensagem Lida" />
                        )}
                      </div>

                      {/* Content Overview */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center flex-wrap gap-2 text-[11px]">
                          {/* Remetente Oficial */}
                          <span className="font-bold text-[#1F2937]">
                            {alt.remetenteOficial || 'Assessoria Fazendária'}
                          </span>

                          <span>•</span>

                          {/* UF badge */}
                          <span className="font-mono px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            UF: {alt.ufAfetada}
                          </span>

                          {/* Urgência */}
                          {alt.urgencia === 'CRITICA' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                              CRÍTICA
                            </span>
                          )}
                          {alt.urgencia === 'ALTA' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                              ALTA
                            </span>
                          )}
                          {alt.urgencia === 'INFORMATIVA' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30 font-mono">
                              INFORMATIVA
                            </span>
                          )}

                          <span className="text-slate-500 font-mono text-[10px] ml-auto sm:ml-0">
                            {alt.dataPublicacao} {alt.horarioPublicacao ? `às ${alt.horarioPublicacao}` : ''}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className={`text-xs sm:text-sm font-bold leading-tight ${!isRead ? 'text-[#1F2937]' : 'text-slate-700'}`}>
                          {alt.titulo}
                        </h4>

                        {/* Short snippet */}
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {alt.resumoCurto || alt.impacto}
                        </p>
                      </div>
                    </div>

                    {/* Expand / Collapse and Read Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isRead) {
                            markAsUnread(alt.id);
                          } else {
                            markAsRead(alt.id);
                          }
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#1F2937] transition-colors text-[11px] flex items-center gap-1 cursor-pointer"
                        title={isRead ? 'Marcar como não lida' : 'Marcar como lida'}
                      >
                        {isRead ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5 text-[#16A34A]" />}
                        <span className="hidden sm:inline">{isRead ? 'Não lida' : 'Lida'}</span>
                      </button>

                      <div className="p-1 text-slate-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content View */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-200 bg-[#F8FAFC] space-y-4 text-xs animate-fadeIn">
                      
                      {/* Segment & Affected NCMs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            Segmento & Aplicação:
                          </span>
                          <p className="text-[#1F2937] text-xs font-medium">{alt.segmento}</p>
                          <p className="text-slate-500 text-[11px] mt-1">{alt.produtosAfetados}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            Vigência & Posições NCM Afetadas:
                          </span>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-slate-500 text-[11px]">Início da Vigência:</span>
                            <span className="font-mono font-bold text-[#166534] bg-[#DCFCE7] px-1.5 py-0.5 rounded border border-[#16A34A]/30 text-[11px]">
                              {alt.dataInicioVigencia}
                            </span>
                          </div>
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="text-[10px] text-slate-500 mr-1">NCMs:</span>
                            {alt.ncmsAfetados.map((ncm) => (
                              <span key={ncm} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {ncm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comparison: Regra Anterior vs Nova Regra Oficial */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                            <span>📜</span> Regra Anterior:
                          </span>
                          <p className="text-slate-700 text-xs font-mono leading-relaxed">
                            {alt.regraAnterior}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#DCFCE7]/50 border border-[#16A34A]/30">
                          <span className="text-[10px] uppercase font-bold text-[#166534] block mb-1.5 flex items-center gap-1.5">
                            <span>⚡</span> Nova Regra Oficial Vigente:
                          </span>
                          <p className="text-[#166534] text-xs font-mono leading-relaxed font-semibold">
                            {alt.novaRegra}
                          </p>
                        </div>
                      </div>

                      {/* Practical Impact for Auto Parts Buyer & Fiscal */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                        <div className="flex items-start gap-2.5">
                          <Sparkles className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-[#1F2937] text-xs">
                              Impacto Prático no Cálculo de ICMS-ST e Compras:
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed">
                              {alt.impacto}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Official Source & Links */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-[11px] border-t border-slate-200">
                        <div className="text-slate-500">
                          <strong className="text-[#1F2937]">Fonte Oficial:</strong> {alt.fonteOficial}
                        </div>

                        <a
                          href={alt.linkOficial}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#16A34A] hover:text-[#15803d] font-semibold shrink-0 cursor-pointer"
                        >
                          <span>Consultar Publicação Oficial</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#16A34A]" />
            <span>
              Todas as {alteracoes.length} alterações estão incorporadas ao motor de cálculo tributário do sistema.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] font-bold transition-colors cursor-pointer text-xs"
          >
            Fechar Caixa de Mensagens
          </button>
        </div>

      </div>
    </div>
  );
};
