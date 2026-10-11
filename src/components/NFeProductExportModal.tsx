import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Edit3,
  RotateCcw,
  Check,
  FileText
} from 'lucide-react';
import { NFeParsed, ItemNFe } from '../types/fiscal';
import { parseNFeXML } from '../services/xmlParser';
import {
  ExportProductRow,
  mapearItensParaExportacao,
  exportarProdutosParaExcel,
} from '../utils/nfeExcelExporter';

interface NFeProductExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  nfeParsed?: NFeParsed | null;
}

export const NFeProductExportModal: React.FC<NFeProductExportModalProps> = ({
  isOpen,
  onClose,
  nfeParsed,
}) => {
  const [rows, setRows] = useState<ExportProductRow[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'upload'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [customXmlName, setCustomXmlName] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializa com a NF-e já carregada se disponível
  useEffect(() => {
    if (nfeParsed && nfeParsed.itens && nfeParsed.itens.length > 0) {
      const mapped = mapearItensParaExportacao(nfeParsed.itens);
      setRows(mapped);
      setCustomXmlName(null);
      setActiveTab('current');
    } else {
      setActiveTab('upload');
    }
  }, [nfeParsed, isOpen]);

  // Handler de upload de novo XML para exportação
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const xmlFile = fileList.find(
      (f) => f.name.toLowerCase().endsWith('.xml') || f.type.toLowerCase().includes('xml')
    );

    if (!xmlFile) {
      setNotification('Por favor, selecione um arquivo XML válido da NF-e.');
      return;
    }

    try {
      const content = await xmlFile.text();
      const parsed = parseNFeXML(content);
      const mapped = mapearItensParaExportacao(parsed.itens);
      setRows(mapped);
      setCustomXmlName(xmlFile.name);
      setNotification(`XML '${xmlFile.name}' carregado com sucesso (${mapped.length} produtos)!`);
      setActiveTab('upload');
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification(`Erro ao ler XML: ${err?.message || 'Arquivo malformado'}`);
    }
  };

  const handleFieldChange = (nItem: number, field: 'descricao' | 'aplicacao', value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.nItem === nItem ? { ...r, [field]: value } : r))
    );
  };

  const handleResetToAuto = () => {
    if (nfeParsed && !customXmlName) {
      setRows(mapearItensParaExportacao(nfeParsed.itens));
    }
    setNotification('Campos restaurados para a detecção automática inteligente.');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleExportExcel = () => {
    if (rows.length === 0) return;
    const nfNumber = nfeParsed?.nNF || 'Export';
    const baseName = `Produtos_NFe_${nfNumber}_Cadastro_MaoNaRoda`;
    exportarProdutosParaExcel(rows, baseName);
    setNotification('Planilha Excel (.xlsx) gerada e baixada com sucesso!');
    setTimeout(() => setNotification(null), 3000);
  };

  // Estatísticas de parsing
  const stats = useMemo(() => {
    const total = rows.length;
    const comVeiculo = rows.filter((r) => r.aplicacao !== r.originalDescription).length;
    const repetidos = total - comVeiculo;
    return { total, comVeiculo, repetidos };
  }, [rows]);

  // Filtro de busca na tabela
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.codDanf.toLowerCase().includes(term) ||
        r.descricao.toLowerCase().includes(term) ||
        r.aplicacao.toLowerCase().includes(term) ||
        r.ncm.includes(term) ||
        r.codCest.includes(term) ||
        r.codBarras.includes(term)
    );
  }, [rows, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl max-h-[94vh] overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-[#16A34A] border border-emerald-200 shadow-2xs">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#1F2937] tracking-tight">
                  Exportador Inteligente de Produtos para Cadastro (Excel .xlsx)
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-[#166534] border border-emerald-200 px-2 py-0.5 rounded-full">
                  Padrão 8 Colunas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Separação automática de <strong>Descrição</strong> e <strong>Aplicação Veicular</strong>, preservando códigos e formatações fiscais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={rows.length === 0}
              className="h-9 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Excel (.xlsx)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1F2937] transition-colors cursor-pointer"
              title="Fechar janela"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notificação Temporária */}
        {notification && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2 text-xs flex items-center justify-between font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Barra de Origem e Ações */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            {/* Seletor de Origem */}
            <div className="flex items-center gap-2">
              {nfeParsed && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('current');
                    setRows(mapearItensParaExportacao(nfeParsed.itens));
                    setCustomXmlName(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'current' && !customXmlName
                      ? 'bg-white text-[#16A34A] border border-slate-200 shadow-2xs'
                      : 'text-slate-600 hover:text-[#1F2937]'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Nota Aberta (NF-e nº {nfeParsed.nNF})</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".xml,text/xml,application/xml"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files);
                  }
                  e.target.value = '';
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  customXmlName
                    ? 'bg-white text-[#16A34A] border border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-[#1F2937]'
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>{customXmlName ? `XML: ${customXmlName}` : 'Subir Outro XML'}</span>
              </button>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
              <div>
                Total: <strong className="text-[#1F2937]">{stats.total} itens</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div className="text-emerald-700">
                Veículo Identificado: <strong>{stats.comVeiculo}</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div className="text-slate-500">
                Repetidos: <strong>{stats.repetidos}</strong>
              </div>
              <button
                type="button"
                onClick={handleResetToAuto}
                className="ml-2 text-slate-400 hover:text-[#1F2937] transition-colors p-1 rounded"
                title="Restaurar separação automática original"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Guia Explicativa dos 8 Campos Obrigatórios */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-[#1F2937] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />
              <span>Padrão Oficial de Colunas da Planilha Excel (.xlsx):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 font-mono text-[11px] pt-1">
              <div className="bg-white p-1.5 rounded border border-slate-200">1. Cod DANF</div>
              <div className="bg-white p-1.5 rounded border border-slate-200 text-[#166534] font-bold">2. Descrição</div>
              <div className="bg-white p-1.5 rounded border border-slate-200 text-blue-700 font-bold">3. Aplicação</div>
              <div className="bg-white p-1.5 rounded border border-slate-200">4. Preço líquido</div>
              <div className="bg-white p-1.5 rounded border border-slate-200">5. Imposto</div>
              <div className="bg-white p-1.5 rounded border border-slate-200">6. Cód. de barras</div>
              <div className="bg-white p-1.5 rounded border border-slate-200">7. Cód. CEST</div>
              <div className="bg-white p-1.5 rounded border border-slate-200">8. NCM</div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              • <strong>Dica</strong>: Você pode editar os campos de <em>Descrição</em> e <em>Aplicação</em> diretamente na tabela abaixo antes de exportar. A planilha final preserva zeros à esquerda e formatações exatas de códigos fiscais e de barras.
            </p>
          </div>

          {/* Barra de Busca de Produtos */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por código, descrição, veículo ou NCM..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Exibindo {filteredRows.length} de {rows.length} itens
            </span>
          </div>

          {/* Tabela de Pré-visualização com 8 Colunas Exatas */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-[#1F2937] font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-28">1. Cod DANF</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 min-w-[200px] text-[#166534]">
                      2. Descrição (Peça)
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-200 min-w-[180px] text-blue-700">
                      3. Aplicação (Veículo/Anos)
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-right w-28">4. Preço líq.</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-right w-24">5. Imposto</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-32">6. Cód. barras</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-24">7. CEST</th>
                    <th className="py-2.5 px-3 w-28">8. NCM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                        Nenhum produto encontrado com o filtro aplicado.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r, index) => {
                      const ehRepetido = r.aplicacao === r.originalDescription;
                      return (
                        <tr key={r.nItem} className="hover:bg-slate-50 transition-colors">
                          {/* 1. Cod DANF */}
                          <td className="py-2 px-3 border-r border-slate-100 font-bold text-slate-800">
                            {r.codDanf}
                          </td>

                          {/* 2. Descrição (Editável inline) */}
                          <td className="py-2 px-3 border-r border-slate-100 font-sans">
                            <input
                              type="text"
                              value={r.descricao}
                              onChange={(e) => handleFieldChange(r.nItem, 'descricao', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-[#16A34A] focus:bg-white text-xs font-semibold text-slate-900 bg-transparent"
                              title="Clique para editar a descrição da peça"
                            />
                          </td>

                          {/* 3. Aplicação (Editável inline) */}
                          <td className="py-2 px-3 border-r border-slate-100 font-sans">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={r.aplicacao}
                                onChange={(e) => handleFieldChange(r.nItem, 'aplicacao', e.target.value)}
                                className={`w-full px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white text-xs font-medium ${
                                  ehRepetido ? 'text-slate-500 italic' : 'text-blue-900 font-semibold'
                                } bg-transparent`}
                                title="Clique para editar a aplicação do veículo"
                              />
                              {!ehRepetido && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-blue-50 text-blue-700 border border-blue-200 shrink-0 font-mono">
                                  Auto
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 4. Preço líquido */}
                          <td className="py-2 px-3 border-r border-slate-100 text-right text-slate-800">
                            R$ {r.precoLiquido.toFixed(2).replace('.', ',')}
                          </td>

                          {/* 5. Imposto */}
                          <td className="py-2 px-3 border-r border-slate-100 text-right text-slate-800">
                            R$ {r.imposto.toFixed(2).replace('.', ',')}
                          </td>

                          {/* 6. Cód. de barras */}
                          <td className="py-2 px-3 border-r border-slate-100 text-slate-600">
                            {r.codBarras || <span className="text-slate-300">—</span>}
                          </td>

                          {/* 7. Cód. CEST */}
                          <td className="py-2 px-3 border-r border-slate-100 text-slate-700 font-bold">
                            {r.codCest || <span className="text-slate-300 font-normal">—</span>}
                          </td>

                          {/* 8. NCM */}
                          <td className="py-2 px-3 text-slate-700 font-bold">
                            {r.ncm}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            <span>
              Planilha gerada com tipos protegidos (NCM e CEST com zeros à esquerda; barras como texto).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleExportExcel}
              disabled={rows.length === 0}
              className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              <span>Baixar Excel com {rows.length} Produtos (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
