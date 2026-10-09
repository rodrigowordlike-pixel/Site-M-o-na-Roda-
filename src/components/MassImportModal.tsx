import React, { useState, useRef } from 'react';
import { X, UploadCloud, Files, FileText, CheckCircle2, Trash2, AlertCircle, Play, Layers } from 'lucide-react';
import { ModalidadeMvaAutopecas } from '../types/fiscal';

interface MassImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessBatchXmls: (
    filesData: { name: string; content: string }[],
    modalidade: ModalidadeMvaAutopecas
  ) => void;
  modalidadeAutopecas: ModalidadeMvaAutopecas;
  isLoading: boolean;
}

export const MassImportModal: React.FC<MassImportModalProps> = ({
  isOpen,
  onClose,
  onProcessBatchXmls,
  modalidadeAutopecas,
  isLoading,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<{ id: string; name: string; content: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesAdded = (filesList: FileList | File[]) => {
    const validXmlFiles: File[] = [];
    Array.from(filesList).forEach((file) => {
      if (file.name.endsWith('.xml') || file.type === 'text/xml') {
        validXmlFiles.push(file);
      }
    });

    if (validXmlFiles.length === 0) {
      setErrorMsg('Nenhum arquivo .xml válido foi encontrado na seleção.');
      return;
    }

    setErrorMsg(null);
    let loadedCount = 0;
    const newItems: { id: string; name: string; content: string }[] = [];

    validXmlFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          content,
        });
        loadedCount++;

        if (loadedCount === validXmlFiles.length) {
          setSelectedFiles((prev) => [...prev, ...newItems]);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
  };

  const handleStartProcess = () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Selecione pelo menos um arquivo XML para calcular.');
      return;
    }
    onProcessBatchXmls(
      selectedFiles.map((f) => ({ name: f.name, content: f.content })),
      modalidadeAutopecas
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col my-auto">
        
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-[#F8FAFC] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/30">
              <Files className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F2937] tracking-tight">
                Importação em Massa de Notas Fiscais (XMLs)
              </h3>
              <p className="text-xs text-slate-500">
                Envie múltiplos arquivos XML para auditoria e cálculo consolidado do ICMS-ST
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

        {/* Corpo do Modal */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xml,text/xml"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFilesAdded(e.target.files);
              }
            }}
          />

          {/* Área de Drop de Múltiplos Arquivos */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-[#16A34A] bg-[#DCFCE7]/60'
                : 'border-slate-300 hover:border-[#16A34A] bg-[#F8FAFC] hover:bg-slate-50'
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] mx-auto mb-2">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div className="text-sm font-bold text-[#1F2937] mb-1">
              Clique aqui ou arraste seus arquivos XML para esta área
            </div>
            <p className="text-xs text-slate-500">
              Você pode selecionar <strong>quantos XMLs quiser</strong> de uma única vez (sem limite de quantidade).
            </p>
          </div>

          {/* Lista de Arquivos Selecionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-[#1F2937] text-xs flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-[#16A34A]" />
                  <span>Fila de Importação: <strong>{selectedFiles.length} {selectedFiles.length === 1 ? 'arquivo' : 'arquivos'} XML</strong></span>
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Limpar Todos
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">#{idx + 1}</span>
                      <FileText className="h-4 w-4 text-[#16A34A] shrink-0" />
                      <span className="font-mono text-xs font-semibold text-[#1F2937] truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="Remover este arquivo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botão de Ação: Processar Lote */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleStartProcess}
              disabled={selectedFiles.length === 0 || isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] active:bg-[#166534] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-green-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>
                {isLoading
                  ? 'Processando Lote...'
                  : `Calcular Lote em Massa (${selectedFiles.length} NFs)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
