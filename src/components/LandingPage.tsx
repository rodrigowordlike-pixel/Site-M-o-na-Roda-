import React from 'react';
import {
  ShieldAlert,
  TrendingDown,
  Calculator,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  Car,
  Building2,
  Wrench,
  Scale,
  Zap,
  Lock,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { MaoNaRodaLogo } from './MaoNaRodaLogo';

interface LandingPageProps {
  onStartUsing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartUsing }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 flex flex-col font-sans">
      {/* 1. Header / Navbar Minimalista & Confiável */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
        <div className="max-w-[1640px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MaoNaRodaLogo className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 shadow-xs" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap">
                  MÃO NA <span className="text-emerald-600">RODA</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/35 whitespace-nowrap">
                  PRO ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">
                Inteligência Fiscal & Auditoria de ICMS-ST em Autopeças · RICMS/PR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Ambiente Lei 21.850/2023 (Alíquota PR 19,5%)
            </span>
          </div>
        </div>
      </header>

      {/* 2. Hero Section — AIDA: Atenção & PREP: Ponto Central */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-white">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-slate opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Tag de Alerta com Gatilho de Atenção */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold tracking-wide shadow-2xs animate-fade-in">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>ALERTA PARA O VAREJO DE AUTOPEÇAS DO PARANÁ (RICMS/PR)</span>
          </div>

          {/* Headline Poderosa (Aversão à Perda) */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Você está vendendo peças no prejuízo sem saber? O{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800 underline decoration-emerald-400 decoration-wavy decoration-2">
              imposto invisível
            </span>{' '}
            que corrói o lucro da sua empresa.
          </h1>

          {/* Subheadline (Interesse & Identificação) */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Se você mexe com comercialização de autopeças e adquire mercadorias de fornecedores de <strong>São Paulo, Santa Catarina, Rio Grande do Sul ou Minas Gerais</strong> sem destaque de ST no XML, a <strong>SEFAZ do Paraná exige até 35% de antecipação tributária</strong> na sua entrada. Se você precificar pelo preço faturado na nota, sua margem evapora no dia de recolher a guia.
          </p>

          {/* Botão de Ação Primária e Micro-Compromissos */}
          <div className="pt-4 flex flex-col items-center justify-center gap-3">
            <button
              onClick={onStartUsing}
              className="px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-base sm:text-lg tracking-wide shadow-xl shadow-emerald-700/25 transition-all cursor-pointer flex items-center gap-3 active:scale-[0.98] group"
            >
              <Zap className="h-5 w-5 fill-white text-white" />
              <span>Quero Usar a Ferramenta Grátis</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Redutores de Fricção e Segurança */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Sem cadastro prévio
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Não precisa de cartão
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-600" /> Leitura segura e confidencial no navegador
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PREP: PONTO, RAZÃO E EXEMPLO PRÁTICO (O Choque de Realidade Matemático) */}
      <section className="py-14 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-[1640px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              METODOLOGIA PREP · O PROBLEMA REAL
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              A diferença entre ter lucro de verdade ou pagar para trabalhar
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Veja o que acontece na prática com um amortecedor comum de suspensão comprado de São Paulo:
            </p>
          </div>

          {/* Cards de Contraste Psicológico (Antes vs Depois) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Card Negativo: A Cegueira Fiscal Comum */}
            <div className="bg-white border-2 border-rose-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                SEM O MÃO NA RODA (O ERRO COMUM)
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">O Prejuízo Disfarçado de Lucro</h3>
                    <p className="text-xs text-slate-500">Precificando apenas pelo valor da nota fiscal</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-xs text-slate-700">
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                    <span>Preço faturado do Amortecedor na NF:</span>
                    <strong className="font-mono text-slate-900">R$ 200,00</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                    <span>Margem que você pretendia colocar (30%):</span>
                    <strong className="font-mono text-slate-900">+ R$ 60,00</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-100 rounded-lg font-semibold">
                    <span>Preço de venda colocado na prateleira:</span>
                    <strong className="font-mono text-slate-900">R$ 260,00</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-lg font-bold text-rose-900">
                    <span>Surpresa da Guia de ICMS-ST (MVA 104,86%):</span>
                    <span className="font-mono text-rose-700">- R$ 56,12</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-bold">Seu Lucro Real Restante:</span>
                  <span className="text-xl font-black font-mono text-rose-600">R$ 3,88</span>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-lg">
                  Margem real de míseros 1,4% (Prejuízo após despesas fixas)
                </span>
              </div>
            </div>

            {/* Card Positivo: A Inteligência com Mão na Roda */}
            <div className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white border-2 border-emerald-500/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
                COM MÃO NA RODA (LUCRO BLINDADO)
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Custo Real Apurado em 3 Segundos</h3>
                    <p className="text-xs text-slate-400">A ST antecipada já embutida no custo do produto</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <div className="flex justify-between p-2.5 bg-white/5 rounded-lg border border-white/5">
                    <span>Preço faturado do Amortecedor na NF:</span>
                    <strong className="font-mono text-white">R$ 200,00</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-300 font-semibold">
                    <span>ICMS-ST apurado pelo sistema (Guia):</span>
                    <strong className="font-mono">+ R$ 56,12</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-white/10 rounded-lg font-bold text-white">
                    <span>CUSTO REAL EFETIVO DA COMPRA:</span>
                    <strong className="font-mono text-emerald-400 text-sm">R$ 256,12</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg font-bold text-emerald-300">
                    <span>Preço de venda correto (30% sobre custo real):</span>
                    <span className="font-mono text-white font-black">R$ 332,95</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Seu Lucro Real Garantido:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">R$ 76,83</span>
                </div>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                  ✓ Margem de 30% limpa e protegida no seu caixa
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AIDA: INTERESSE & PARA QUEM É A FERRAMENTA */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-[1640px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              PÚBLICO-ALVO · QUEM PRECISA DA FERRAMENTA
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Para quem foi feito o Mão na Roda?
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Criado especificamente para as dores do setor automotivo e fiscal que operam compras interestaduais para o Paraná:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Perfil 1: Lojas de Autopeças */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 space-y-3 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Lojas de Autopeças e Motopeças</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compram de distribuidoras de SP, SC e RS e precisam colocar a peça à venda sabendo na vírgula quanto a guia de ST encareceu cada código.
              </p>
            </div>

            {/* Perfil 2: Centros Automotivos & Oficinas */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 space-y-3 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="h-12 w-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Centros Automotivos & Oficinas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aplicam peças de reposição em serviços e precisam repassar o custo tributário exato no orçamento sem tomar prejuízo no fechamento da ordem de serviço.
              </p>
            </div>

            {/* Perfil 3: Gerentes e Compradores */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 space-y-3 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Gerentes e Compradores de Peças</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Precisam comparar se compensa mais comprar de um fornecedor nacional com 12% ou de uma importadora com 4% (que estoura a MVA em 104,86%).
              </p>
            </div>

            {/* Perfil 4: Escritórios Contábeis e Fiscais */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 space-y-3 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Contadores e Analistas Fiscais</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eliminam horas de cálculos manuais em planilhas para emitir a GNRE/DARE (Código 10008-0) com homologação 100% blindada pela Lei 21.850/2023.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AIDA: DESEJO & O QUE A FERRAMENTA FAZ */}
      <section className="py-14 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-[1640px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              FUNCIONALIDADES DE NÍVEL EMPRESARIAL
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              O que o sistema faz por você em poucos segundos?
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Tudo o que você demorava horas montando em planilhas complexas, resolvido em segundos no seu navegador:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-xs transition-all">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 w-fit text-emerald-600">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Auditoria Algorítmica da NF-e (22 Regras)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Varre cada item do XML verificando NCM, CEST, alíquotas interestaduais (4% vs 12%), MVA Original vs Ajustada e dedução legítima do crédito do remetente.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-xs transition-all">
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 w-fit text-sky-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Custo Real Efetivo da Compra</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apresenta lado a lado o valor da nota fiscal e o custo final real após a guia de antecipação tributária. Chega de surpresas ao pagar o imposto.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-xs transition-all">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 w-fit text-emerald-600">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dossiê Completo para Pagamento da Guia</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gera os parâmetros prontos para a emissão da GNRE ou DARE no portal da SEFAZ Paraná: Código da Receita 10008-0, base de cálculo ST e chave de acesso oficial.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-xs transition-all">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 w-fit text-indigo-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Exportador Inteligente para Excel (.xlsx)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Separa automaticamente a descrição pura da peça de sua aplicação/modelo de veículo e gera planilha formatada em 8 colunas para você cadastrar no seu ERP.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-xs transition-all">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 w-fit text-amber-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Blindagem contra Autuações SEFAZ-PR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculado rigorosamente conforme a nova alíquota interna de 19,5% (Lei Estadual 21.850/2023) e Protocolo ICMS 41/2008 de autopeças.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-xs transition-all">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Auditoria em Massa (Lotes Múltiplos)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recebe dezenas de XMLs de fornecedores ao mesmo tempo, consolida o valor total a recolher e detalha peça por peça sem lentidão.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DEPOIMENTOS & PROVA SOCIAL */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-[1640px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              PROVA SOCIAL · QUEM USA APROVA
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              O que dizem os empresários e líderes fiscais
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Veja como o Mão na Roda transformou a rotina de apuração tributária de quem compra para o Paraná:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Depoimento 1 */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-sm font-bold">{s}</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;Antes gastávamos horas conferindo NCM por NCM e MVA em planilhas manuais. Hoje arrastamos o XML de São Paulo e temos o custo exato em segundos. Salvou nossa margem de lucro!&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  CA
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Carlos Alberto</div>
                  <div className="text-[11px] text-slate-500">Diretor Comercial · Auto Peças Curitiba</div>
                </div>
              </div>
            </div>

            {/* Depoimento 2 */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-sm font-bold">{s}</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;A SEFAZ do Paraná exige rigor na antecipação tributária (Lei 21.850/2023). Com o sistema, geramos o borderô e a memória de cálculo com 100% de blindagem contra autuações.&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                  MV
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Marcos Vinicius</div>
                  <div className="text-[11px] text-slate-500">Gerente Fiscal · Distribuidora Londrina</div>
                </div>
              </div>
            </div>

            {/* Depoimento 3 */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-sm font-bold">{s}</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;Indico para todos os nossos clientes do setor automotivo. A exportação inteligente para o Excel com separação de descrição e aplicação é um verdadeiro diferencial.&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  FS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Fernanda Souza</div>
                  <div className="text-[11px] text-slate-500">Contadora Sênior · FS Assessoria Tributária</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ (PERGUNTAS FREQUENTES) */}
      <section className="py-14 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200/70 px-3 py-1 rounded-lg border border-slate-300">
              DÚVIDAS COMUNS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Perguntas Frequentes sobre o Mão na Roda
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Tudo o que você precisa saber antes de começar a auditar suas notas fiscais gratuitamente.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">P</span>
                A ferramenta é realmente 100% gratuita?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                Sim! Todas as funcionalidades do sistema — desde a leitura e auditoria de arquivos XML e chaves de acesso até a apuração do ICMS-ST, dossiê de pagamento e exportação para Excel — são totalmente gratuitas para uso ilimitado.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">P</span>
                Meus dados fiscais e arquivos XML ficam salvos em algum servidor?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                Não. A leitura e a auditoria ocorrem de forma 100% local no seu navegador web com segurança e criptografia TLS 1.3. Nenhum arquivo XML ou dado sensível de sua empresa é armazenado em nossos servidores.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">P</span>
                Funciona para quais estados de origem e destino?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                O sistema foi desenvolvido sob medida para compras interestaduais realizadas de qualquer fornecedor (SP, SC, RS, MG, ES, etc.) com destino a empresas localizadas no estado do <strong>Paraná</strong>, aplicando rigorosamente a alíquota interna de 19,5% (Lei Estadual 21.850/2023) e Protocolo ICMS 41/2008.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">P</span>
                Como emito a guia GNRE ou DARE após a auditoria?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                Após auditar a NF-e, o sistema gera automaticamente um Dossiê completo com todos os parâmetros exigidos pela SEFAZ-PR (Código da Receita 10008-0, base de cálculo ST, alíquota e chave de acesso), permitindo que você preencha a guia no portal oficial em poucos cliques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. AIDA: AÇÃO FINAL (Call to Action Irresistível) */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            ACESSO IMEDIATO · SEM CUSTO
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Pare de perder dinheiro em compras para sua empresa hoje mesmo.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tenha em mãos a mesma tecnologia tributária utilizada pelos maiores grupos de distribuição e proteja a margem de lucro da sua empresa.
          </p>

          <div className="pt-4 flex flex-col items-center justify-center gap-3">
            <button
              onClick={onStartUsing}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-black text-lg sm:text-xl tracking-wide shadow-2xl shadow-emerald-700/40 transition-all cursor-pointer flex items-center gap-3 active:scale-[0.98] group"
            >
              <span>Quero Usar a Ferramenta Grátis</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-slate-400 font-medium">
              Clique para abrir imediatamente o sistema com todas as funcionalidades liberadas.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Footer Corporativo */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800 text-slate-500 text-xs">
        <div className="max-w-[1640px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MaoNaRodaLogo className="h-6 w-6" />
            <span className="font-bold text-slate-400">Mão na Roda Pro Enterprise</span>
            <span>·</span>
            <span>Homologado RICMS/PR (Lei Estadual 21.850/2023)</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Protocolo ICMS 41/2008 · Convênio ICMS 142/2018 · Confidencialidade e Segurança TLS 1.3
          </div>
        </div>
      </footer>
    </div>
  );
};
