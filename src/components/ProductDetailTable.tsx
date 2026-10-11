import React, { useState, useMemo } from 'react';
import {
  Eye,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  CheckCircle,
  Search,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { ItemAuditoria, ClassificacaoST } from '../types/fiscal';

interface ProductDetailTableProps {
  itens: ItemAuditoria[];
  onSelectMemoria: (item: ItemAuditoria) => void;
  onToggleForcarST?: (itemNumero: number, forcar: boolean) => void;
  onUpdateMvaManual?: (itemNumero: number, mva: number) => void;
  onOpenProductExport?: () => void;
}

export const ProductDetailTable: React.FC<ProductDetailTableProps> = ({
  itens,
  onSelectMemoria,
  onToggleForcarST,
  onUpdateMvaManual,
  onOpenProductExport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IMPORTADO' | 'NACIONAL' | 'COM_ST'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  // Filtragem
  const filteredItens = useMemo(() => {
    return itens.filter((it) => {
      const matchSearch =
        it.item.xProd.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.item.cProd.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.item.ncm.includes(searchTerm);

      if (!matchSearch) return false;

      const isImportado = ['1', '2', '3', '8'].includes(it.item.origem);

      if (filterType === 'IMPORTADO') return isImportado;
      if (filterType === 'NACIONAL') return !isImportado;
      if (filterType === 'COM_ST') return it.totalRecolher > 0;
      return true;
    });
  }, [itens, searchTerm, filterType]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredItens.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItens = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredItens.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItens, safePage, itemsPerPage]);

  const totalSTItens = useMemo(() => {
    return itens.reduce((acc, it) => acc + it.totalRecolher, 0);
  }, [itens]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs mb-6">
      {/* Header com Filtros Rápidos do Comprador */}
      <div className="p-5 border-b border-slate-200 bg-[#F8FAFC] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#1F2937] tracking-tight flex items-center gap-2">
              <Package className="h-4 w-4 text-[#16A34A]" />
              Peças da NF-e ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] font-mono font-bold border border-[#16A34A]/30">
              Total ST: {formatBRL(totalSTItens)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo individualizado com MVA oficial de autopeças (104,86% Importados · 87,78% Nacionais)
          </p>
        </div>

        {/* Controles: Busca, Filtro e Quantidade por Página */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Campo de Busca */}
          <div className="relative min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar peça, código ou NCM..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-[#1F2937] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          {/* Filtros Rápidos */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => {
                setFilterType('ALL');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-[#16A34A] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Todos ({itens.length})
            </button>
            <button
              onClick={() => {
                setFilterType('IMPORTADO');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'IMPORTADO'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Importados (4%)
            </button>
            <button
              onClick={() => {
                setFilterType('NACIONAL');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'NACIONAL'
                  ? 'bg-[#166534] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              Nacionais (12%)
            </button>
          </div>

          {/* Seletor de Itens por Página */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 text-[11px]">Exibir:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-[#1F2937] font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value={20}>20 itens</option>
              <option value={50}>50 itens</option>
              <option value={100}>100 itens</option>
            </select>
          </div>

          {onOpenProductExport && (
            <button
              type="button"
              onClick={onOpenProductExport}
              className="h-7.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
              title="Exportar produtos para planilha Excel (.xlsx) com padrão oficial de 8 colunas e separação de descrição e aplicação"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Exportar (.xlsx)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4 min-w-[260px]">Descrição da Peça</th>
              <th className="py-3 px-3 text-center">Tipo / Origem</th>
              <th className="py-3 px-3 text-center">Qtd</th>
              <th className="py-3 px-3 text-right">Preço NF (Unit)</th>
              <th className="py-3 px-3 text-right text-[#166534]">ST por Peça</th>
              <th className="py-3 px-3 text-right font-bold text-[#166534]">Total ST a Pagar</th>
              <th className="py-3 px-4 text-right font-bold text-[#16A34A]">Custo Total de Entrada</th>
              <th className="py-3 px-4 text-center">Memória</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedItens.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                  Nenhuma peça encontrada com o filtro aplicado.
                </td>
              </tr>
            ) : (
              paginatedItens.map((auditado) => {
                const item = auditado.item;
                const isImportado = ['1', '2', '3', '8'].includes(item.origem);
                const stUnitario = item.qCom > 0 ? auditado.totalRecolher / item.qCom : 0;
                const custoFinalTotalItem = item.vProd + auditado.totalRecolher;

                return (
                  <tr
                    key={item.nItem}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      #{item.nItem.toString().padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1F2937]">{item.xProd}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                        <span>Cód: {item.cProd}</span>
                        <span>·</span>
                        <span>NCM: {item.ncm}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isImportado ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          Importado (4% ➔ 104,86%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30">
                          Nacional (12% ➔ 87,78%)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-[#1F2937]">
                      {item.qCom} <span className="text-slate-400 text-[10px]">{item.uCom}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {formatBRL(item.vUnCom)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#166534] font-semibold">
                      +{formatBRL(stUnitario)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-[#166534]">
                      {formatBRL(auditado.totalRecolher)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-black text-[#16A34A] text-sm">
                        {formatBRL(custoFinalTotalItem)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        NF: {formatBRL(item.vProd)} + ST: {formatBRL(auditado.totalRecolher)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectMemoria(auditado)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#1F2937] border border-slate-200 transition-colors inline-flex items-center gap-1 text-[11px] px-2.5 font-medium cursor-pointer shadow-2xs"
                        title="Ver memória e fórmula completa"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#16A34A]" />
                        <span>Ver Fórmula</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginação */}
      <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-600 font-medium">
          Exibindo{' '}
          <strong className="text-[#1F2937]">
            {filteredItens.length > 0 ? (safePage - 1) * itemsPerPage + 1 : 0}
          </strong>{' '}
          a{' '}
          <strong className="text-[#1F2937]">
            {Math.min(safePage * itemsPerPage, filteredItens.length)}
          </strong>{' '}
          de <strong className="text-[#166534]">{filteredItens.length}</strong> peças
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#1F2937] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#1F2937] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[#1F2937] font-mono font-bold">
              Página {safePage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#1F2937] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#1F2937] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
