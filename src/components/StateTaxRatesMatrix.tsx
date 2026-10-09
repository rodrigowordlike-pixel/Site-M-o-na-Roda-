import React, { useState } from 'react';
import { Globe, Search, Filter, ShieldCheck, ExternalLink, Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { TABELA_UFS } from '../data/fiscalTaxDatabase';
import { UF } from '../types/fiscal';

export const StateTaxRatesMatrix: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('TODAS');

  const ufs = Object.keys(TABELA_UFS) as UF[];

  // Cálculo da MVA Ajustada para cada UF (MVA Original 71,78% de Autopeças)
  const mvaOriginal = 71.78;

  const dadosMatriz = ufs.map((uf) => {
    const info = TABELA_UFS[uf];
    const aliqIntra = info.aliquotaInternaModal;
    const aliqIntraDec = aliqIntra / 100;

    // MVA Ajustada 4% (Importados)
    const mvaImportado = ((1 + mvaOriginal / 100) * (1 - 0.04) / (1 - aliqIntraDec) - 1) * 100;
    
    // MVA Ajustada 12% (Nacional Sul/Sudeste)
    const mvaNacional12 = ((1 + mvaOriginal / 100) * (1 - 0.12) / (1 - aliqIntraDec) - 1) * 100;

    // MVA Ajustada 7% (Nacional para N/NE/CO/ES)
    const mvaNacional7 = ((1 + mvaOriginal / 100) * (1 - 0.07) / (1 - aliqIntraDec) - 1) * 100;

    const signatarioProtocolo41 = [
      'SP', 'PR', 'MG', 'RJ', 'RS', 'SC', 'BA', 'PE', 'GO', 'DF', 'MT', 'MS', 'ES', 'CE', 'PA', 'AL', 'PB', 'RN', 'SE', 'TO', 'RO', 'AC', 'AP', 'AM', 'PI', 'MA', 'RR'
    ].includes(uf);

    return {
      uf,
      nome: info.nome,
      regiao: info.regiao,
      aliqIntra,
      aliqFCP: info.aliquotaFCPPadrao,
      calculoDIFAL: info.calculoDIFAL,
      ricmsNorma: info.ricmsNorma,
      ricmsLink: info.ricmsLink,
      mvaImportado,
      mvaNacional12,
      mvaNacional7,
      signatarioProtocolo41,
    };
  });

  const filtered = dadosMatriz.filter((d) => {
    const matchSearch =
      d.uf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = selectedRegion === 'TODAS' || d.regiao === selectedRegion;
    return matchSearch && matchRegion;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
      {/* Header do Módulo */}
      <div className="p-5 border-b border-slate-200 bg-[#F8FAFC] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30">
              <Globe className="h-3.5 w-3.5 text-[#16A34A]" />
              Tabela de Alíquotas Nacionais de Autopeças (27 UFs)
            </span>
            <span className="text-xs text-slate-500">
              Alíquotas Internas Vigentes · MVAs Calculadas · Protocolo ICMS 41/2008
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] tracking-tight">
            Tabela Completa de Alíquotas e MVAs Estado a Estado
          </h2>
        </div>

        {/* Controles: Busca e Filtro de Região */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar Estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#1F2937] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#1F2937] font-medium focus:outline-none focus:border-[#16A34A]"
          >
            <option value="TODAS">Todas as Regiões</option>
            <option value="Sul">Sul</option>
            <option value="Sudeste">Sudeste</option>
            <option value="Centro-Oeste">Centro-Oeste</option>
            <option value="Nordeste">Nordeste</option>
            <option value="Norte">Norte</option>
          </select>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200 font-semibold">
              <th className="p-3.5 pl-5">UF / Estado</th>
              <th className="p-3.5">Alíquota Interna</th>
              <th className="p-3.5">MVA Imp. (4%)</th>
              <th className="p-3.5">MVA Nac. (12%)</th>
              <th className="p-3.5">MVA Nac. (7%)</th>
              <th className="p-3.5">Convênio ST</th>
              <th className="p-3.5 pr-5 text-right">Legislação / Base</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#1F2937]">
            {filtered.map((item) => (
              <tr key={item.uf} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="p-3.5 pl-5 font-bold flex items-center gap-2">
                  <span className="h-7 w-7 rounded-lg bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30 flex items-center justify-center font-mono text-xs">
                    {item.uf}
                  </span>
                  <div>
                    <div className="text-[#1F2937] font-semibold">{item.nome}</div>
                    <div className="text-[10px] text-slate-400">{item.regiao}</div>
                  </div>
                </td>
                <td className="p-3.5 font-mono font-bold text-[#166534]">
                  {item.aliqIntra.toFixed(1)}%
                </td>
                <td className="p-3.5 font-mono text-slate-700">
                  {item.mvaImportado.toFixed(2)}%
                </td>
                <td className="p-3.5 font-mono text-slate-700">
                  {item.mvaNacional12.toFixed(2)}%
                </td>
                <td className="p-3.5 font-mono text-slate-700">
                  {item.mvaNacional7.toFixed(2)}%
                </td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#166534]">
                    <CheckCircle2 className="h-3 w-3 text-[#16A34A]" />
                    Protocolo 41/08
                  </span>
                </td>
                <td className="p-3.5 pr-5 text-right">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.ricmsNorma}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
