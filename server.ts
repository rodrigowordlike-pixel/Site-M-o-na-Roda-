import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Auditor Fiscal Universal de NF-e', timestamp: new Date().toISOString() });
});

// AI Fiscal Audit route (server-side proxy)
app.post('/api/ai-fiscal-audit', async (req, res) => {
  try {
    const { nfeData, specificQuestion } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Chave de API do Gemini não configurada no servidor (.env.example GEMINI_API_KEY).'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Você é o AUDITOR FISCAL UNIVERSAL DE NF-E BRASILEIRO.
Sua missão é responder: "Quanto devo recolher nesta operação?"
A prioridade absoluta é: PRECISÃO > VELOCIDADE. NUNCA invente legislação, alíquota, MVA, CEST ou regra de ST.
Se houver incerteza ou conflito, marque como "⚠️ CÁLCULO NÃO CONFIRMADO" e especifique o que precisa ser verificado.

DADOS DA OPERAÇÃO:
- NF-e: ${nfeData?.nNF || 'N/A'}, Série: ${nfeData?.serie || 'N/A'}, Data: ${nfeData?.dhEmi || 'N/A'}
- UF Origem (Emitente): ${nfeData?.ufEmit || 'N/A'} (CRT: ${nfeData?.crt || 'N/A'}, CNPJ: ${nfeData?.cnpjEmit || 'N/A'})
- UF Destino (Destinatário): ${nfeData?.ufDest || 'N/A'} (IE Dest: ${nfeData?.indIEDest || 'N/A'}, CNPJ: ${nfeData?.cnpjDest || 'N/A'})
- Finalidade: ${nfeData?.finalidade || 'Revenda'} | Consumidor Final: ${nfeData?.indFinal === '1' ? 'Sim' : 'Não'}

ITENS ANALISADOS:
${JSON.stringify(nfeData?.itens || [], null, 2)}

PERGUNTA OU PONTO ESPECÍFICO DE AUDITORIA:
${specificQuestion || 'Auditoria fiscal completa de responsabilidade tributária do destinatário (ICMS-ST, DIFAL, FCP-ST, IPI).'}

INSTRUÇÕES ESTRITAS:
1. Analise cada produto pela ótica da legislação oficial (CONFAZ, Convênio 142/2018, Protocolos interestaduais, RICMS da UF de Destino).
2. Verifique se o destinatário é o responsável pelo recolhimento na entrada da mercadoria (antecipação tributária / ausência de acordo interestadual).
3. Classifique cada item entre:
   - A — Sem ST
   - B — ST já retida
   - C — ST devida pelo destinatário
   - D — ST possivelmente devida, mas não confirmada
   - E — Não é possível determinar
4. Verifique cálculo de MVA Original vs MVA Ajustada (atenção especial: se emitente for Simples Nacional, aplica-se MVA Original conforme Convênio ICMS 35/2011).
5. Forneça o parecer com fontes oficiais (artigos e decretos reais, ex: RICMS/SP Dec 45.490/00, RICMS/PR Dec 7.871/17, Convênio 142/18).
6. Se algum dado não puder ser 100% confirmado, alerte com "⚠️ CÁLCULO NÃO CONFIRMADO".
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Você é um Auditor Fiscal Tributário especialista em ICMS, ICMS-ST, DIFAL e IPI em todas as 27 UFs do Brasil. Rigor absoluto, sem alucinações, com citação de legislação oficial e alertas claros.',
        temperature: 0.1,
      },
    });

    return res.json({
      analysis: response.text,
      auditedAt: new Date().toISOString(),
      modelUsed: 'gemini-2.5-flash'
    });
  } catch (error: any) {
    console.error('Fiscal AI Audit Error:', error);
    return res.status(500).json({
      error: error?.message || 'Erro ao processar auditoria fiscal com IA.'
    });
  }
});

// Setup Vite development server or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AUDITOR FISCAL] Servidor rodando na porta ${PORT}`);
  });
}

startServer();
