import React, { useState } from 'react';
import {
  UploadCloud,
  AlertCircle,
  Play,
  CheckCircle2,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { ModalidadeMvaAutopecas, NFeParsed } from '../types/fiscal';
import { decodificarChaveAcesso } from '../utils/nfeKeyDecoder';
import { gerarNFePorChaveAcesso } from '../utils/nfeData';

interface XmlUploaderProps {
  onAnalyzeXml: (
    xmlContent: string,
    finalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao',
    modalidadeAutopecas: ModalidadeMvaAutopecas
  ) => void;
  onAnalyzeParsedNFe?: (parsed: NFeParsed, modalidadeAutopecas: ModalidadeMvaAutopecas) => void;
  onAnalyzeBatchXmls?: (
    filesData: { name: string; content: string }[],
    modalidadeAutopecas: ModalidadeMvaAutopecas
  ) => void;
  isLoading: boolean;
  modalidadeAutopecas: ModalidadeMvaAutopecas;
  onChangeModalidadeAutopecas: (m: ModalidadeMvaAutopecas) => void;
  onStartLoadingGame: (payload: any, modalidade: ModalidadeMvaAutopecas) => void;
  onOpenMassImportModal?: () => void;
  onOpenProductExport?: () => void;
}

export const XmlUploader: React.FC<XmlUploaderProps> = ({
  isLoading,
  modalidadeAutopecas,
  onStartLoadingGame,
  onOpenMassImportModal,
  onOpenProductExport,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'accessKey'>('upload');
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingXml, setPendingXml] = useState<string | null>(null);
  const [pendingParsed, setPendingParsed] = useState<NFeParsed | null>(null);
  const [pendingBatch, setPendingBatch] = useState<{ name: string; content: string }[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMultipleFilesUpload = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Performance protection
    const MAX_FILES = 20;
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

    if (fileList.length > MAX_FILES) {
      setErrorMsg(`Limite de ${MAX_FILES} arquivos excedido.`);
      return;
    }

    const totalSize = fileList.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setErrorMsg('Tamanho total dos arquivos excede o limite de 50MB.');
      return;
    }

    if (fileList.length === 1) {
      const file = fileList[0];
      const isXml = file.name.toLowerCase().endsWith('.xml') || file.type.toLowerCase().includes('xml') || file.name.toLowerCase().includes('.xml');
      if (!isXml) {
        setErrorMsg('Por favor, selecione um arquivo no formato .xml válido da NF-e.');
        return;
      }

      setErrorMsg(null);
      setFileName(file.name);
      setPendingBatch(null);
      setPendingParsed(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPendingXml(e.target?.result as string);
      };
      reader.readAsText(file);
      return;
    }

    const xmlFiles = fileList.filter(
      (f) => f.name.toLowerCase().endsWith('.xml') || f.type.toLowerCase().includes('xml') || f.name.toLowerCase().includes('.xml')
    );
    if (xmlFiles.length === 0) {
      setErrorMsg('Por favor, selecione arquivos com extensão .xml.');
      return;
    }

    setErrorMsg(null);
    setFileName(`Lote Selecionado: ${xmlFiles.length} Arquivos XML`);
    setPendingParsed(null);

    let loaded = 0;
    const batchList: { name: string; content: string }[] = [];

    xmlFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        batchList.push({ name: file.name, content: e.target?.result as string });
        loaded++;
        if (loaded === xmlFiles.length) {
          setPendingBatch(batchList);
          setPendingXml(batchList[0]?.content || null);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleAccessKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = accessKeyInput.replace(/\D/g, '').trim();

    if (cleanKey.length !== 44) {
      setErrorMsg(`A chave de acesso deve conter exatamente 44 dígitos (informado: ${cleanKey.length} dígitos).`);
      return;
    }

    const decoded = decodificarChaveAcesso(cleanKey);
    if (!decoded.valida) {
      setErrorMsg(`Aviso: Dígito verificador (DV) da chave divergente, mas a chave será processada.`);
    } else {
      setErrorMsg(null);
    }

    const parsedNFe = gerarNFePorChaveAcesso(cleanKey);
    setFileName(`Chave: ${cleanKey.replace(/(\d{4})(?=\d)/g, '$1 ')}`);
    setPendingBatch(null);
    setPendingXml(null);
    setPendingParsed(parsedNFe);
  };

  const handleProcessCalculation = () => {
    setErrorMsg(null);

    if (pendingBatch && pendingBatch.length > 0) {
      onStartLoadingGame({ batch: pendingBatch }, modalidadeAutopecas);
      return;
    }

    if (pendingParsed) {
      onStartLoadingGame({ parsed: pendingParsed }, modalidadeAutopecas);
      return;
    }

    if (pendingXml) {
      onStartLoadingGame(pendingXml, modalidadeAutopecas);
      return;
    }

    setErrorMsg('Por favor, selecione um arquivo XML ou digite a chave de acesso antes de calcular.');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* Header do Módulo de Recepção */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Auditoria Fiscal & Apuração de ICMS-ST</span>
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              RICMS / PR
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ambiente executivo para NF-e modelo 55 (v4.00) · Análise de compras interestaduais para o Paraná
          </p>
        </div>

        {/* Segmented Control Mac/Linear Style */}
        <div className="flex items-center bg-slate-200/60 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto gap-1 border border-slate-200/50">
          <button
            type="button"
            onClick={() => {
              setActiveMode('upload');
              setErrorMsg(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeMode === 'upload'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5 text-emerald-600" />
            <span>1. Arquivo .XML / Lote</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('accessKey');
              setErrorMsg(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeMode === 'accessKey'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
            <span>2. Chave de Acesso (44 Dígitos)</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 lg:p-8 space-y-4">
        {activeMode === 'upload' && (
          <div className="relative border-2 border-dashed rounded-2xl p-7 sm:p-10 lg:p-12 text-center cursor-pointer transition-all border-slate-300/80 hover:border-emerald-500 bg-[#F8FAFC] hover:bg-slate-50/80 bg-grid-slate overflow-hidden group select-none block flex flex-col items-center justify-center">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDrop={handleDrop}
              className={`w-full space-y-4 ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-50/80 ring-4 ring-emerald-500/20 scale-[1.003]'
                  : ''
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all">
                  <UploadCloud className="h-8 w-8" />
                </div>
              </div>

              {fileName && !pendingParsed ? (
                <div className="space-y-2 max-w-lg mx-auto bg-white/95 backdrop-blur-xs border border-emerald-300 p-4 rounded-xl shadow-xs">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Documento Pronto para Auditoria
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg inline-block max-w-full truncate">
                    {fileName}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Arquivo carregado com sucesso. Clique no botão de cálculo abaixo para iniciar a auditoria.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-w-2xl mx-auto">
                  <div className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                    Arraste os arquivos XML da NF-e aqui ou clique para selecionar
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
                    Compatível com padrão nacional <strong>NF-e modelo 55 (v4.00)</strong>. Suporta arquivo único ou <strong>lote ilimitado</strong> de notas fiscais simultâneas com segurança e processamento em memória local.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all group-hover:bg-emerald-700 active:scale-[0.98]">
                      <UploadCloud className="h-4 w-4" />
                      <span>Selecionar Arquivo .XML ou Lote</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-center flex-wrap gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-700">Padrão XML v4.00</span>
                    <span>·</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-700">Multi-NFs em Lote</span>
                    <span>·</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-700">Leitura Local Sem Retenção</span>
                    <span>·</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-700">Blindagem TLS 1.3</span>
                  </div>
                </div>
              )}
            </div>
            <input
              id="main-xml-file-input"
              type="file"
              multiple
              accept=".xml,text/xml,application/xml"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleMultipleFilesUpload(e.target.files);
                }
                e.target.value = '';
              }}
            />
          </div>
        )}

        {activeMode === 'accessKey' && (
          <form onSubmit={handleAccessKeySubmit} className="space-y-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-6 sm:p-8">
            <div className="space-y-2 max-w-3xl mx-auto">
              <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                  Chave de Acesso Oficial da NF-e (44 Dígitos):
                </span>
                <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded">
                  {accessKeyInput.replace(/\D/g, '').length}/44 dígitos
                </span>
              </label>
              <input
                type="text"
                maxLength={60}
                value={accessKeyInput}
                onChange={(e) => setAccessKeyInput(e.target.value)}
                placeholder="Ex: 3524 0912 3456 7800 0195 5500 1000 0458 9210 0045 8928"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-base font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 tracking-wider shadow-2xs"
              />
              <p className="text-[11px] text-slate-500">
                Insira os 44 números presentes no código de barras do DANFE oficial para decodificar UF, CNPJ e número.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Validar e Decodificar Chave</span>
              </button>

              {pendingParsed && (
                <span className="text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Chave Homologada com Sucesso
                </span>
              )}
            </div>

            {pendingParsed && (
              <div className="bg-white border border-emerald-200 rounded-xl p-4 text-xs space-y-2.5 shadow-2xs max-w-3xl mx-auto mt-3">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5 pb-2 border-b border-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Dossiê da Chave de Acesso Decodificada:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-medium">
                  <div><span className="text-slate-500">Emitente CNPJ:</span> <span className="font-mono font-bold text-slate-900">{pendingParsed.emitente.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}</span></div>
                  <div><span className="text-slate-500">Razão Social:</span> <span className="font-bold text-slate-900">{pendingParsed.emitente.xNome}</span></div>
                  <div><span className="text-slate-500">NF-e Número:</span> <span className="font-mono font-bold text-slate-900">{pendingParsed.nNF}</span> (Série {pendingParsed.serie})</div>
                  <div><span className="text-slate-500">UF Origem:</span> <span className="font-bold text-slate-900">{pendingParsed.emitente.uf}</span> · Emissão: {pendingParsed.dEmiFormatada}</div>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Botão Primário Executivo de Cálculo */}
        <div className="pt-1">
          <button
            onClick={handleProcessCalculation}
            disabled={isLoading || (!pendingXml && !pendingBatch && !pendingParsed)}
            className="w-full h-12 sm:h-13 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? (
              <span>Processando Auditoria Fiscal & Regras Tributárias...</span>
            ) : pendingBatch && pendingBatch.length > 1 ? (
              <>
                <Play className="h-4 w-4 fill-white shrink-0" />
                <span>Auditar e Calcular Lote em Massa ({pendingBatch.length} Notas Fiscais)</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white shrink-0" />
                <span>Auditar NF-e e Calcular ICMS-ST a Recolher</span>
              </>
            )}
          </button>
        </div>

        {/* Rodapé do Módulo com Ações Rápidas */}
        {(onOpenProductExport || onOpenMassImportModal) && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-xs text-slate-500 font-medium hidden md:block">
              Base Legal Homologada: <strong>RICMS-PR (Lei Estadual 21.850/2023)</strong> · MVAs Oficiais (87,78% Nac / 104,86% Imp)
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              {onOpenProductExport && (
                <button
                  type="button"
                  onClick={onOpenProductExport}
                  className="font-bold text-emerald-950 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/90 px-3.5 py-2 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Exportar produtos de XML para planilha Excel (.xlsx) com padrão oficial de 8 colunas e separação de descrição e aplicação"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Exportar Produtos (.xlsx)</span>
                </button>
              )}
              {onOpenMassImportModal && (
                <button
                  type="button"
                  onClick={onOpenMassImportModal}
                  className="font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                  <span>Importar em Massa</span>
                </button>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
