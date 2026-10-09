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
  isLoading: boolean;
  modalidadeAutopecas: ModalidadeMvaAutopecas;
  onChangeModalidadeAutopecas: (m: ModalidadeMvaAutopecas) => void;
  onStartLoadingGame: (xmlContent: string, modalidade: ModalidadeMvaAutopecas) => void;
}

export const XmlUploader: React.FC<XmlUploaderProps> = ({
  onAnalyzeXml,
  isLoading,
  modalidadeAutopecas,
  onChangeModalidadeAutopecas,
  onStartLoadingGame,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'key'>('upload');
  const [chaveAcessoInput, setChaveAcessoInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>('NF-e Exemplo Padrão (Autopeças).xml');
  const [pendingXml, setPendingXml] = useState<string | null>(SAMPLE_NFES[0].xml);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.xml') && file.type !== 'text/xml') {
      setErrorMsg('Por favor, selecione um arquivo válido com extensão .xml');
      return;
    }
    setErrorMsg(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPendingXml(content);
    };
    reader.onerror = () => {
      setErrorMsg('Erro ao ler o arquivo XML selecionado.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Modo 1: Upload Direto do Arquivo XML */}
        {activeMode === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,text/xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
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
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#16A34A] bg-[#DCFCE7]/60 scale-[0.99]'
                  : 'border-slate-300 hover:border-[#16A34A] bg-[#F8FAFC] hover:bg-slate-50'
              }`}
            >
              <div className="h-14 w-14 rounded-2xl bg-[#DCFCE7] border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] mx-auto mb-3">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="text-sm font-medium text-[#1F2937] mb-2">
                {fileName ? (
                  <div className="space-y-2 max-w-md mx-auto">
                    <div className="text-[#166534] font-semibold flex items-center justify-center gap-1.5">
                      <span>✓ Nota Fiscal Selecionada:</span>
                    </div>
                    <div className="text-[#166534] font-mono text-xs sm:text-sm bg-[#DCFCE7] border border-[#16A34A]/30 px-3 py-1.5 rounded-xl inline-block max-w-full truncate shadow-xs">
                      {fileName}
                    </div>
                    <div className="text-xs text-slate-500 font-normal">
                      Clique aqui caso queira enviar outro arquivo XML
                    </div>
                  </div>
                ) : (
                  'Clique aqui ou arraste o arquivo XML da Nota Fiscal'
                )}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Envie o XML da NF-e para calcular automaticamente a substituição tributária (ICMS-ST) de autopeças.
              </p>
            </div>
          </div>
        )}

        {/* Modo 2: Digitar Chave de Acesso / Código */}
        {activeMode === 'key' && (
          <form onSubmit={handleSearchByKey} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-[#16A34A]" />
                Digite ou Cole a Chave de Acesso (44 dígitos) ou Número da NF-e:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: 3524 1000 1234 5678 0001 5500 1000 0012 3410 0000 0000"
                  value={chaveAcessoInput}
                  onChange={(e) => setChaveAcessoInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono text-[#1F2937] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
                >
                  <Search className="h-4 w-4 text-white" />
                  <span>Selecionar Nota</span>
                </button>
              </div>
            </div>
            {fileName && (
              <div className="text-xs text-[#166534] font-mono">
                Nota selecionada: {fileName}
              </div>
            )}
          </form>
        )}

        {/* Botão de Iniciar Cálculo (Disponível assim que houver XML/Chave carregada) */}
        {pendingXml && (
          <div className="pt-2 animate-fade-in">
            <button
              onClick={() => {
                if (pendingXml) {
                  onStartLoadingGame(pendingXml, modalidadeAutopecas);
                }
              }}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-[#16A34A] hover:bg-[#15803d] text-white font-black text-sm tracking-wider uppercase shadow-md shadow-green-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.01]"
            >
              <Play className="h-5 w-5 fill-white" />
              <span>INICIAR CÁLCULO AGORA!</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
