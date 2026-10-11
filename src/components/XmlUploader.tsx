import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  AlertCircle,
  Play,
  FileCode,
  HelpCircle,
  CheckCircle2,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { ModalidadeMvaAutopecas, NFeParsed } from '../types/fiscal';
import { decodificarChaveAcesso } from '../utils/nfeKeyDecoder';

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

import { gerarNFePorChaveAcesso } from '../utils/nfeData';

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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      <div className="px-4 py-3 border-b border-slate-100 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[#1F2937] tracking-tight">
            Apuração de ICMS-ST e Auditoria Fiscal
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Escolha uma das duas opções oficiais para apuração da Substituição Tributária
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium self-start sm:self-auto flex-wrap gap-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveMode('upload');
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'upload'
                ? 'bg-white text-[#16A34A] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-[#1F2937]'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>1. Subir Arquivo .XML</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('accessKey');
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'accessKey'
                ? 'bg-white text-[#16A34A] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-[#1F2937]'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>2. Digitar Chave de Acesso</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 space-y-3">
        {activeMode === 'upload' && (
          <>

            <div className="relative border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all border-slate-300 hover:border-[#16A34A] bg-[#F8FAFC] hover:bg-slate-50 overflow-hidden group select-none block">
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
                className={`relative space-y-2 ${
                  dragOver
                    ? 'border-[#16A34A] bg-[#DCFCE7]/60 ring-2 ring-[#16A34A]/30 scale-[1.005]'
                    : ''
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2.5">
                  <div className="h-10 w-10 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shadow-2xs group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                </div>

                {fileName && !pendingParsed ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <FileCode className="h-3.5 w-3.5" /> Arquivo XML NF-e Pronto
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-[#166534] bg-[#DCFCE7] border border-[#16A34A]/20 px-3 py-1 rounded-md inline-block max-w-full truncate shadow-2xs">
                      {fileName}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Clique em qualquer lugar deste quadro para substituir por outro arquivo XML
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm sm:text-base font-bold text-[#1F2937]">
                      Clique em qualquer lugar deste quadro ou arraste o arquivo XML
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Suporta arquivos <strong>.xml</strong> padrão NF-e modelo 55 (v4.00) ou selecione múltiplos para lote.
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                        <UploadCloud className="h-4 w-4" />
                        <span>Selecionar Arquivo .XML do Computador</span>
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <span className="inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        Exclusivo .XML (v4.00)
                      </span>
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
          </>
        )}

        {activeMode === 'accessKey' && (
          <form onSubmit={handleAccessKeySubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#1F2937] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5 text-[#16A34A]" />
                  Chave de Acesso da NF-e (44 Dígitos):
                </span>
                <span className="text-[10px] text-slate-500">
                  {accessKeyInput.replace(/\D/g, '').length}/44 dígitos
                </span>
              </label>
              <input
                type="text"
                maxLength={60}
                value={accessKeyInput}
                onChange={(e) => setAccessKeyInput(e.target.value)}
                placeholder="Ex: 3326 0713 6447 0400 0149 5500 1000 0548 0210 6251 2020"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-[#1F2937] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#16A34A] tracking-wider"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Validar e Carregar Chave</span>
              </button>

              {pendingParsed && (
                <span className="text-xs font-semibold text-[#166534] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Chave Decodificada com Sucesso
                </span>
              )}
            </div>

            {pendingParsed && (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs space-y-1.5">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Dados Decodificados da Chave de Acesso:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-emerald-800">
                  <div><strong>Emitente CNPJ:</strong> {pendingParsed.emitente.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}</div>
                  <div><strong>Razão Social:</strong> {pendingParsed.emitente.xNome}</div>
                  <div><strong>NF-e Nº:</strong> {pendingParsed.nNF} | <strong>Série:</strong> {pendingParsed.serie}</div>
                  <div><strong>UF Origem:</strong> {pendingParsed.emitente.uf} | <strong>Emissão:</strong> {pendingParsed.dEmiFormatada}</div>
                </div>
              </div>
            )}
          </form>
        )}

        <div>
          <button
            onClick={handleProcessCalculation}
            disabled={isLoading || (!pendingXml && !pendingBatch && !pendingParsed)}
            className="w-full h-11 px-4 rounded-lg bg-[#16A34A] hover:bg-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Calculando ICMS-ST...</span>
            ) : pendingBatch && pendingBatch.length > 1 ? (
              <>
                <Play className="h-4 w-4 fill-white shrink-0" />
                <span>Calcular Lote em Massa ({pendingBatch.length} NFs)</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white shrink-0" />
                <span>Calcular ICMS-ST a Recolher</span>
              </>
            )}
          </button>
        </div>

            {(onOpenProductExport || onOpenMassImportModal) && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                {onOpenProductExport && (
                  <button
                    type="button"
                    onClick={onOpenProductExport}
                    className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Exportar produtos de XML para planilha Excel (.xlsx) com padrão oficial de 8 colunas e separação de descrição e aplicação"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Exportar Produtos p/ Cadastro (.xlsx)</span>
                  </button>
                )}
                {onOpenMassImportModal && (
                  <button
                    type="button"
                    onClick={onOpenMassImportModal}
                    className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                    <span>Importação em Lote de XMLs</span>
                  </button>
                )}
              </div>
            )}

        {errorMsg && (
          <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
