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
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)] mb-6">
      {/* Header com Filtros Rápidos do Comprador */}
      <div className="p-5 border-b border-slate-200 bg-[#F8FAFC] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <span>Itens da NF-e ({itens.length} {itens.length === 1 ? 'item' : 'itens'})</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200/90 tabular-nums">
              Total ST: {formatBRL(totalSTItens)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Apuração analítica por item com MVA oficial de autopeças (104,86% Importados · 87,78% Nacionais)
          </p>
        </div>

        {/* Controles: Busca, Filtro e Quantidade por Página */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Campo de Busca */}
          <div className="relative min-w-[220px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar peça, código ou NCM..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-2xs"
            />
          </div>

          {/* Filtros Rápidos Segmentados */}
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl border border-slate-200/60 text-xs gap-1">
            <button
              onClick={() => {
                setFilterType('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({itens.length})
            </button>
            <button
              onClick={() => {
                setFilterType('IMPORTADO');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'IMPORTADO'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Importados (4%)
            </button>
            <button
              onClick={() => {
                setFilterType('NACIONAL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'NACIONAL'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nacionais (12%)
            </button>
          </div>

          {/* Seletor de Itens por Página */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className="text-slate-500 text-[11px] font-medium">Exibir:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
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
              className="h-8.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
              title="Exportar produtos para planilha Excel (.xlsx) com padrão oficial de 9 colunas e separação de descrição, aplicação e quantidade"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Exportar (.xlsx)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Produtos Corporativa de Alta Densidade */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4 min-w-[280px]">Descrição da Peça</th>
              <th className="py-3 px-3 text-center">Tipo / Origem</th>
              <th className="py-3 px-3 text-center">Qtd</th>
              <th className="py-3 px-3 text-right">Preço Unit.</th>
              <th className="py-3 px-3 text-right hidden xl:table-cell text-slate-600">Total NF</th>
              <th className="py-3 px-3 text-center hidden 2xl:table-cell text-slate-600">MVA %</th>
              <th className="py-3 px-3 text-right hidden lg:table-cell text-slate-600">Base ST</th>
              <th className="py-3 px-3 text-right text-emerald-800">ST Unitária</th>
              <th className="py-3 px-3 text-right font-bold text-emerald-900">Total ST Guia</th>
              <th className="py-3 px-4 text-right font-bold text-emerald-800 min-w-[150px]">Custo Real Total</th>
              <th className="py-3 px-4 text-center">Memória</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedItens.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500 text-xs">
                  Nenhum item fiscal localizado com os parâmetros selecionados.
                </td>
              </tr>
            ) : (
              paginatedItens.map((auditado) => {
                const item = auditado.item;
                const isImportado = ['1', '2', '3', '8'].includes(item.origem);
                const stUnitario = item.qCom > 0 ? auditado.totalRecolher / item.qCom : 0;
                const custoFinalTotalItem = item.vProd + auditado.totalRecolher;
                const mvaPercent = auditado.memoriaCalculo?.mvaAplicada || (isImportado ? 104.86 : 87.78);

                return (
                  <tr
                    key={item.nItem}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{item.nItem.toString().padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.xProd}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                        <span>Cód: <strong className="text-slate-700">{item.cProd}</strong></span>
                        <span>·</span>
                        <span>NCM: <strong className="text-slate-700">{item.ncm}</strong></span>
                        <span className="hidden xl:inline">·</span>
                        <span className="hidden xl:inline text-slate-400">CFOP: {item.cfop}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {isImportado ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          Importado (4% ➔ 104,86%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                          Nacional (12% ➔ 87,78%)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800 tabular-nums whitespace-nowrap">
                      {item.qCom} <span className="text-slate-400 text-[10px] font-normal">{item.uCom}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {formatBRL(item.vUnCom)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600 hidden xl:table-cell whitespace-nowrap">
                      {formatBRL(item.vProd)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums font-semibold text-slate-700 hidden 2xl:table-cell whitespace-nowrap">
                      {mvaPercent.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 hidden lg:table-cell whitespace-nowrap">
                      {formatBRL(auditado.baseST)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-emerald-800 font-semibold whitespace-nowrap">
                      +{formatBRL(stUnitario)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-black text-emerald-900 whitespace-nowrap">
                      {formatBRL(auditado.totalRecolher)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-mono tabular-nums font-black text-emerald-700 text-sm">
                        {formatBRL(custoFinalTotalItem)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                        NF: {formatBRL(item.vProd)} + ST: {formatBRL(auditado.totalRecolher)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectMemoria(auditado)}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors inline-flex items-center gap-1.5 text-[11px] px-2.5 font-semibold cursor-pointer shadow-2xs hover:border-slate-300"
                        title="Ver memória e fórmula completa"
                      >
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Ver Fórmula</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredItens.length > 0 && (
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold text-slate-800">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 text-slate-600 uppercase tracking-wider text-[11px]">
                  Totais Consolidados ({filteredItens.length} itens)
                </td>
                <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-900 font-bold">
                  {filteredItens.reduce((acc, it) => acc + it.item.qCom, 0)}
                </td>
                <td className="py-3.5 px-3 text-right text-slate-400 font-mono">-</td>
                <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-900 hidden xl:table-cell font-bold">
                  {formatBRL(filteredItens.reduce((acc, it) => acc + it.item.vProd, 0))}
                </td>
                <td className="py-3.5 px-3 text-center hidden 2xl:table-cell text-slate-400 font-mono">-</td>
                <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 hidden lg:table-cell">
                  {formatBRL(filteredItens.reduce((acc, it) => acc + (it.baseST || 0), 0))}
                </td>
                <td className="py-3.5 px-3 text-right text-slate-400 font-mono">-</td>
                <td className="py-3.5 px-3 text-right font-mono tabular-nums font-black text-emerald-900 bg-emerald-100/60">
                  {formatBRL(totalSTItens)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums font-black text-emerald-800 bg-emerald-50/50">
                  {formatBRL(filteredItens.reduce((acc, it) => acc + it.item.vProd + it.totalRecolher, 0))}
                </td>
                <td className="py-3.5 px-4"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Barra de Paginação */}
      <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-600 font-medium">
          Exibindo{' '}
          <strong className="text-slate-900 font-mono">
            {filteredItens.length > 0 ? (safePage - 1) * itemsPerPage + 1 : 0}
          </strong>{' '}
          a{' '}
          <strong className="text-slate-900 font-mono">
            {Math.min(safePage * itemsPerPage, filteredItens.length)}
          </strong>{' '}
          de <strong className="text-emerald-800 font-mono font-bold">{filteredItens.length}</strong> peças auditadas
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs shadow-2xs">
              Página {safePage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
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
