import React, { useState, useRef } from 'react';
import { UploadCloud, Search, KeyRound, AlertCircle, Wrench, Sparkles, Play } from 'lucide-react';
import { SAMPLE_NFES } from '../data/sampleXmls';
import { ModalidadeMvaAutopecas } from '../types/fiscal';

interface XmlUploaderProps {
  onAnalyzeXml: (
    xmlContent: string,
    finalidade: 'Revenda' | 'UsoConsumo' | 'AtivoImobilizado' | 'Industrializacao',
    modalidadeAutopecas: ModalidadeMvaAutopecas
  ) => void;
  onAnalyzeBatchXmls?: (
    filesData: { name: string; content: string }[],
    modalidadeAutopecas: ModalidadeMvaAutopecas
  ) => void;
  isLoading: boolean;
  modalidadeAutopecas: ModalidadeMvaAutopecas;
  onChangeModalidadeAutopecas: (m: ModalidadeMvaAutopecas) => void;
  onStartLoadingGame: (payload: any, modalidade: ModalidadeMvaAutopecas) => void;
  onOpenMassImportModal?: () => void;
}

export const XmlUploader: React.FC<XmlUploaderProps> = ({
  onAnalyzeXml,
  onAnalyzeBatchXmls,
  isLoading,
  modalidadeAutopecas,
  onChangeModalidadeAutopecas,
  onStartLoadingGame,
  onOpenMassImportModal,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'key'>('upload');
  const [chaveAcessoInput, setChaveAcessoInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingXml, setPendingXml] = useState<string | null>(null);
  const [pendingBatch, setPendingBatch] = useState<{ name: string; content: string }[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMultipleFilesUpload = (files: FileList | File[]) => {
    const xmlFiles = Array.from(files).filter(
      (f) => f.name.endsWith('.xml') || f.type === 'text/xml'
    );

    if (xmlFiles.length === 0) {
      setErrorMsg('Por favor, selecione arquivos válidos com extensão .xml');
      return;
    }

    setErrorMsg(null);

    if (xmlFiles.length === 1) {
      const file = xmlFiles[0];
      setFileName(file.name);
      setPendingBatch(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPendingXml(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      // Múltiplos arquivos (Importação em Massa)
      setFileName(`Lote em Massa: ${xmlFiles.length} Arquivos XML`);
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
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleSearchByKey = (e: React.FormEvent) => {
    e.preventDefault();
    const chaveLimpa = chaveAcessoInput.replace(/\D/g, '').trim();

    if (!chaveLimpa) {
      setErrorMsg('Digite a chave de acesso (44 dígitos) ou número da NF-e.');
      return;
    }

    const sample = SAMPLE_NFES.find(
      (s) => s.xml.includes(chaveLimpa) || s.xml.includes(chaveAcessoInput)
    ) || SAMPLE_NFES[0];

    setErrorMsg(null);
    setFileName(`NF-e ${chaveLimpa.substring(0, 8)}...`);
    setPendingXml(sample.xml);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Header Compacto do Card de Cálculo */}
      <div className="px-4 py-3 border-b border-slate-100 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[#1F2937] tracking-tight flex items-center gap-1.5">
            <span>Calcular ICMS-ST</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Envie o XML da NF-e para começar
          </p>
        </div>

        {/* Alternador de Modo: Arquivo XML vs Chave */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-white text-[#16A34A] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-[#1F2937]'
            }`}
          >
            Arquivo XML
          </button>
          <button
            onClick={() => setActiveMode('key')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              activeMode === 'key'
                ? 'bg-white text-[#16A34A] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-[#1F2937]'
            }`}
          >
            Chave de Acesso
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Modo 1: Upload Direto do Arquivo XML */}
        {activeMode === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xml,text/xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleMultipleFilesUpload(e.target.files);
                }
              }}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-3.5 sm:p-4 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#16A34A] bg-[#DCFCE7]/60'
                  : 'border-slate-300 hover:border-[#16A34A] bg-[#F8FAFC] hover:bg-slate-50'
              }`}
            >
              <div className="h-8 w-8 rounded-lg bg-[#DCFCE7] border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] mx-auto mb-1.5">
                <UploadCloud className="h-4 w-4" />
              </div>
              
              {fileName ? (
                <div className="space-y-1">
                  <div className="text-xs text-[#166534] font-semibold flex items-center justify-center gap-1">
                    <span>✓ Arquivo Selecionado:</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#166534] bg-[#DCFCE7] border border-[#16A34A]/20 px-2.5 py-0.5 rounded-md inline-block max-w-full truncate">
                    {fileName}
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Clique aqui para trocar de arquivo
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#1F2937]">
                    Clique aqui ou arraste o arquivo XML da NF-e
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Formato .xml oficial de NF-e (v4.00)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modo 2: Digitar Chave de Acesso */}
        {activeMode === 'key' && (
          <form onSubmit={handleSearchByKey} className="space-y-2.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#1F2937] flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-[#16A34A]" />
                Digite a Chave de Acesso ou Número da NF-e:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: 3524 1000 1234 5678 0001 5500 1000 0012 3410 0000 0000"
                  value={chaveAcessoInput}
                  onChange={(e) => setChaveAcessoInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-[#1F2937] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <Search className="h-3.5 w-3.5 text-white" />
                  <span>Selecionar</span>
                </button>
              </div>
            </div>
            {fileName && (
              <div className="text-xs text-[#166534] font-mono font-bold">
                Nota selecionada: {fileName}
              </div>
            )}
          </form>
        )}

        {/* Botão Principal: Calcular ICMS-ST */}
        <div>
          <button
            onClick={() => {
              if (pendingBatch && pendingBatch.length > 0) {
                onStartLoadingGame({ batch: pendingBatch }, modalidadeAutopecas);
              } else if (pendingXml) {
                onStartLoadingGame(pendingXml, modalidadeAutopecas);
              }
            }}
            disabled={isLoading || (!pendingXml && !pendingBatch)}
            className="w-full h-10 px-4 rounded-lg bg-[#16A34A] hover:bg-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4 fill-white shrink-0" />
            <span>
              {isLoading
                ? 'Calculando ICMS-ST...'
                : pendingBatch && pendingBatch.length > 1
                ? `Calcular Lote em Massa (${pendingBatch.length} NFs)`
                : 'Calcular ICMS-ST'}
            </span>
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
