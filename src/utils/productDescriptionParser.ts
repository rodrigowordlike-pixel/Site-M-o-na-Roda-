/**
 * Motor Inteligente de Interpretação e Separação de Autopeças (Descrição vs Aplicação)
 * Mão na Roda — Padrão Especializado em Autopeças e Cadastros Automotivos
 */

export interface ParsedProductDescription {
  original: string;
  descricao: string;
  aplicacao: string;
  confianca: 'ALTA' | 'REVISAR';
  motivo?: string;
  veiculoDetectado?: string;
}

// 1. Marcas conhecidas de veículos
const MARCAS = [
  'VOLKSWAGEN', 'VW',
  'FIAT',
  'CHEVROLET', 'GM',
  'FORD',
  'RENAULT',
  'PEUGEOT',
  'CITROEN', 'CITROËN',
  'TOYOTA',
  'HONDA',
  'HYUNDAI',
  'NISSAN',
  'MITSUBISHI',
  'JEEP',
  'KIA',
  'CHERY', 'CAOA',
  'BMW',
  'MERCEDES', 'MB', 'MERCEDES-BENZ',
  'AUDI',
  'VOLVO',
  'SCANIA',
  'IVECO',
  'SUZUKI',
  'SUBARU',
  'DODGE',
  'RAM',
  'CHRYSLER',
  'LAND ROVER',
  'TROLLER',
  'JAC'
];

// 2. Modelos populares e históricos de veículos
const MODELOS = [
  // VW
  'GOL', 'VOYAGE', 'PARATI', 'SAVEIRO', 'FOX', 'CROSSFOX', 'SPACEFOX', 'SPACE FOX',
  'POLO', 'GOLF', 'JETTA', 'PASSAT', 'SANTANA', 'QUANTUM', 'FUSCA', 'BRASILIA',
  'KOMBI', 'UP', 'UP!', 'T-CROSS', 'TCROSS', 'NIVUS', 'TAOS', 'AMAROK', 'VIRTUS',
  'BORA', 'APOLLO', 'LOGUS', 'POINTER', 'VARIANT', 'TL', 'SP2', 'CORRADO',
  
  // FIAT
  'PALIO', 'PALIO WEEKEND', 'WEEKEND', 'SIENA', 'STRADA', 'UNO', 'MILLE', 'FIORINO',
  'PUNTO', 'LINEA', 'BRAVO', 'BRAVA', 'IDEA', 'DOBLO', 'DOBLÒ', 'MOBI', 'ARGO',
  'CRONOS', 'TORO', 'PULSE', 'FASTBACK', 'DUCATO', 'TEMPRA', 'TIPO', 'MAREA',
  'ELBA', 'PREMIO', 'PRÊMIO', '147', 'OGGI', 'SPIDER', 'STILO', 'FREEMONT',
  
  // CHEVROLET / GM
  'CORSA', 'CELTA', 'PRISMA', 'ONIX', 'ONIX PLUS', 'CLASSIC', 'AGILE', 'MONTANA',
  'MERIVA', 'ZAFIRA', 'ASTRA', 'VECTRA', 'OMEGA', 'SUPREMA', 'KADETT', 'IPANEMA',
  'MONZA', 'CHEVETTE', 'MARAJO', 'CHEVY', 'S10', 'S-10', 'BLAZER', 'SPIN', 'COBALT',
  'CRUZE', 'TRACKER', 'CAPTIVA', 'EQUINOX', 'SONIC', 'TRAILBLAZER', 'OPALA', 'CARAVAN',
  'D20', 'C10', 'A10', 'SILVERADO', 'BONANZA', 'VERANEIO', 'MALIBU', 'CAMARO',
  
  // FORD
  'KA', 'FIESTA', 'ECOSPORT', 'ECO SPORT', 'FOCUS', 'FUSION', 'RANGER', 'COURIER',
  'ESCORT', 'VERONA', 'DEL REY', 'DEL REY BELINA', 'CORCEL', 'PAMPA', 'CARGO',
  'TRANSIT', 'F1000', 'F-1000', 'F4000', 'F-4000', 'F250', 'F-250', 'MAVERICK',
  'EDGE', 'TERRITORY', 'BRONCO', 'MONDEO', 'TAURUS', 'VERSAILLES', 'ROYALE',
  
  // RENAULT
  'CLIO', 'SANDERO', 'LOGAN', 'DUSTER', 'OROCH', 'KWID', 'CAPTUR', 'MEGANE',
  'SCENIC', 'MASTER', 'KANGOO', 'FLUENCE', 'SYMBOL', 'TWINGO', 'TRAFIC',
  
  // PEUGEOT
  '206', '207', '208', '306', '307', '308', '405', '406', '407', '408',
  '2008', '3008', '5008', 'PARTNER', 'BOXER', 'HOGGAR',
  
  // CITROËN
  'C3', 'C4', 'C4 CACTUS', 'C4 PALLAS', 'C4 PICASSO', 'AIRCROSS', 'PICASSO',
  'XSARA', 'XANTIA', 'BERLINGO', 'JUMPER', 'JUMPY', 'C5',
  
  // TOYOTA
  'COROLLA', 'COROLLA CROSS', 'HILUX', 'SW4', 'ETIOS', 'YARIS', 'RAV4', 'BANDEIRANTE',
  'FIELDER', 'CAMRY', 'PRIUS',
  
  // HONDA
  'CIVIC', 'FIT', 'CITY', 'HR-V', 'HRV', 'CR-V', 'CRV', 'WR-V', 'WRV', 'ACCORD',
  
  // HYUNDAI
  'HB20', 'HB20S', 'HB20X', 'CRETA', 'I30', 'IX35', 'TUCSON', 'SANTA FE',
  'AZERA', 'ELANTRA', 'VELOSTER', 'VERACRUZ', 'HR',
  
  // NISSAN
  'MARCH', 'VERSA', 'KICKS', 'SENTRA', 'FRONTIER', 'TIIDA', 'LIVINA', 'GRAND LIVINA',
  
  // MITSUBISHI
  'L200', 'TRITON', 'PAJERO', 'PAJERO TR4', 'TR4', 'PAJERO DAKAR', 'ASX', 'ECLIPSE CROSS', 'LANCER', 'OUTLANDER',
  
  // JEEP
  'RENEGADE', 'COMPASS', 'COMMANDER', 'CHEROKEE', 'GRAND CHEROKEE', 'WRANGLER',
  
  // KIA
  'SPORTAGE', 'CERATO', 'SOUL', 'PICANTO', 'SORENTO', 'BONGO', 'BESTA', 'CARNIVAL'
];

// 3. Posições e adjetivos de peças que pertencem à DESCRIÇÃO (não devem ir para aplicação)
const POSICOES_E_ADJETIVOS = [
  'DIANTEIRO', 'DIANTEIRA', 'DIANT', 'DIANT.',
  'TRASEIRO', 'TRASEIRA', 'TRAS', 'TRAS.',
  'ESQUERDO', 'ESQUERDA', 'ESQ', 'ESQ.', 'LE', 'L.E.', 'LADO ESQUERDO',
  'DIREITO', 'DIREITA', 'DIR', 'DIR.', 'LD', 'L.D.', 'LADO DIREITO',
  'SUPERIOR', 'SUP', 'SUP.',
  'INFERIOR', 'INF', 'INF.',
  'CENTRAL', 'CENTRO',
  'LATERAL', 'LATERAIS',
  'INTERNO', 'INTERNA', 'INT', 'INT.',
  'EXTERNO', 'EXTERNA', 'EXT', 'EXT.',
  'SUPERIOR/INFERIOR',
  'SUPERIOR ESQUERDO', 'SUPERIOR DIREITO',
  'INFERIOR ESQUERDO', 'INFERIOR DIREITO',
  'C/ FURO', 'S/ FURO', 'C/ MILHA', 'S/ MILHA',
  'COM FURO', 'SEM FURO', 'COM MILHA', 'SEM MILHA',
  'P/ PINTURA', 'PARA PINTURA', 'LISO', 'TEXTURIZADO',
  'FUME', 'FUMÊ', 'CRISTAL', 'CROMADO', 'PRETO', 'CINZA',
  'MANUAL', 'ELETRICO', 'ELÉTRICO',
  'COM CONTROLE', 'SEM CONTROLE',
  'C/ PISCA', 'S/ PISCA', 'COM PISCA', 'SEM PISCA',
  'RETILINEO', 'ESPORTIVO'
];

// 4. Especificações técnicas que NUNCA são aplicação de veículo
const SPECS_TECNICAS = [
  /\bH[1-9]\b/i,
  /\bH1[1-6]\b/i,
  /\bH27\b/i,
  /\bHB[3-4]\b/i,
  /\b(12|24)V\b/i,
  /\b(5|10|16|21|35|55|60|65|70|75|80|100)W\b/i,
  /\b[124]\s*PORTAS?\b/i,
  /\b[124]P\b/i,
  /\b(2|4)\s*PTS?\b/i,
  /\bARO\s*\d{2}\b/i,
  /\b\d{2,3}MM\b/i,
  /\b\d{2,3}CM\b/i,
  /\b\d{2,3}X\d{2,3}\b/i,
  /\b\d{1,3}(?:[.,]\d{1,3})?\s*(?:KG|G|ML|L|M)\b/i,
  /\bLED\b/i,
  /\bXENON\b/i,
  /\bSUPER\s*BRANCA\b/i,
  /\bT10\b/i,
  /\bP21W\b/i,
  /\bW5W\b/i,
  /\bBAY15D\b/i,
  /\bBA15S\b/i
];

/**
 * Normaliza espaçamentos e caracteres especiais mantendo o texto original
 */
function limparEspacos(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Analisa a descrição do produto da NF-e e faz a separação inteligente em
 * 'Descrição' (o que é a peça) e 'Aplicação' (veículo e anos aos quais ela se aplica)
 */
export function interpretarDescricaoAutopeca(rawDescricao: string): ParsedProductDescription {
  const original = limparEspacos(rawDescricao || '');
  if (!original) {
    return {
      original: '',
      descricao: '',
      aplicacao: '',
      confianca: 'REVISAR',
      motivo: 'Descrição em branco no documento fiscal.'
    };
  }

  // Regex de anos:
  // 95/99, 2009 A 2012, 2012/2015, 2010 ATE 2015, 2018+, 2015 EM DIANTE, 1996-2000, 08/12
  const anoRegex = /\b(?:(?:19|20)\d{2}\s*(?:A|ATE|ATÉ|\/|-)\s*(?:(?:19|20)\d{2}|\d{2})|\d{2}\/\d{2}|(?:19|20)\d{2}\s*(?:\+|EM\s*DIANTE)|\b(?:19|20)\d{2}\b)\b/i;
  
  // Regex de gerações (G1, G2, G3, G4, G5, G6, G7, G8, MK4, MK7, FASE 1, FASE 2)
  const geracaoRegex = /\b(?:G-[1-8]|G[1-8]|MK[1-8]|FASE\s*[1-4]|GERA[CÇ][AÃ]O\s*[1-8])\b/i;

  // Busca se há modelo ou marca de veículo
  let modeloEncontrado: { modelo: string; index: number } | null = null;

  // Procura pelo primeiro modelo que aparece no texto (maior comprimento tem prioridade para evitar falsos positivos)
  const modelosOrdenados = [...MODELOS].sort((a, b) => b.length - a.length);

  for (const mod of modelosOrdenados) {
    const regex = new RegExp(`\\b${mod}\\b`, 'i');
    const match = original.match(regex);
    if (match && match.index !== undefined) {
      if (!modeloEncontrado || match.index < modeloEncontrado.index) {
        modeloEncontrado = { modelo: match[0].toUpperCase(), index: match.index };
      }
    }
  }

  // Busca se há marca que aparece antes do modelo
  let marcaEncontrada: { marca: string; index: number } | null = null;
  const marcasOrdenadas = [...MARCAS].sort((a, b) => b.length - a.length);

  for (const m of marcasOrdenadas) {
    const regex = new RegExp(`\\b${m}\\b`, 'i');
    const match = original.match(regex);
    if (match && match.index !== undefined) {
      if (!marcaEncontrada || match.index < marcaEncontrada.index) {
        marcaEncontrada = { marca: match[0].toUpperCase(), index: match.index };
      }
    }
  }

  // Determina onde começa a aplicação veicular
  let corteIndex = -1;
  let veiculoDetectado = '';

  if (marcaEncontrada && modeloEncontrado) {
    corteIndex = Math.min(marcaEncontrada.index, modeloEncontrado.index);
    veiculoDetectado = `${marcaEncontrada.marca} ${modeloEncontrado.modelo}`;
  } else if (modeloEncontrado) {
    corteIndex = modeloEncontrado.index;
    veiculoDetectado = modeloEncontrado.modelo;
  } else if (marcaEncontrada) {
    // Se só achou a marca, verifica se há ano ou geração logo após
    const resto = original.substring(marcaEncontrada.index);
    if (anoRegex.test(resto) || geracaoRegex.test(resto)) {
      corteIndex = marcaEncontrada.index;
      veiculoDetectado = marcaEncontrada.marca;
    }
  }

  // Caso não tenha encontrado modelo nem marca, verifica se há padrão de ano que indique aplicação veicular
  if (corteIndex === -1) {
    const matchAno = original.match(anoRegex);
    if (matchAno && matchAno.index !== undefined) {
      // Verifica se antes do ano há alguma palavra que possa ser veículo (ex: PALIO, CORSA, etc.)
      const textoAntesDoAno = original.substring(0, matchAno.index).trim();
      const palavrasAntes = textoAntesDoAno.split(/\s+/);
      const ultimaPalavra = palavrasAntes[palavrasAntes.length - 1];

      // Se a última palavra não for posição ou especificação técnica, ela pode ser o veículo
      const ehPosicao = POSICOES_E_ADJETIVOS.some((p) => p.toUpperCase() === ultimaPalavra?.toUpperCase());
      const ehSpec = SPECS_TECNICAS.some((s) => s.test(ultimaPalavra || ''));

      if (!ehPosicao && !ehSpec && palavrasAntes.length > 1) {
        const possivelInicio = original.lastIndexOf(ultimaPalavra);
        if (possivelInicio > 0) {
          corteIndex = possivelInicio;
          veiculoDetectado = ultimaPalavra;
        }
      }
    }
  }

  // Se conseguiu identificar um ponto de divisão consistente
  if (corteIndex > 0) {
    let parteDescricao = original.substring(0, corteIndex).trim();
    let parteAplicacao = original.substring(corteIndex).trim();

    // Remove traços ou barras soltas no final da descrição ou início da aplicação (ex: "FAROL - GOL 95" -> "FAROL", "GOL 95")
    parteDescricao = parteDescricao.replace(/[\s\-_/:]+$/, '').trim();
    parteAplicacao = parteAplicacao.replace(/^[\s\-_/:]+/, '').trim();

    // Se por acaso a parte de descrição ficou muito curta (ex: menos de 2 caracteres)
    if (parteDescricao.length >= 2 && parteAplicacao.length >= 2) {
      return {
        original,
        descricao: parteDescricao,
        aplicacao: parteAplicacao,
        confianca: 'ALTA',
        veiculoDetectado
      };
    }
  }

  // =========================================================================
  // CASO DE SALVAGUARDA (REGRA OBRIGATÓRIA):
  // Se a aplicação não for identificada com segurança (ex: "LÂMPADA H7 12V 55W" ou embalagens),
  // a aplicação DEVE REPETIR a descrição original conforme especificação do produto.
  // =========================================================================
  return {
    original,
    descricao: original,
    aplicacao: original,
    confianca: 'ALTA',
    motivo: 'Não há aplicação veicular específica identificada. A aplicação repete a descrição original conforme regra do produto.'
  };
}
