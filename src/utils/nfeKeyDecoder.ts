/**
 * Utilitário de Decodificação e Validação de Chave de Acesso de NF-e (44 Dígitos)
 * Padrão Manual de Orientação do Contribuinte (MOC) - SEFAZ / ENCAT
 */

export interface DecodedKeyInfo {
  chave: string;
  valida: boolean;
  ufCodigo: string;
  ufSigla: string;
  ufNome: string;
  anoMes: string;
  ano: string;
  mes: string;
  cnpj: string;
  cnpjFormatado: string;
  modelo: string;
  modeloDescricao: string;
  serie: string;
  numeroNF: string;
  numeroNFFormatado: string;
  tipoEmissao: string;
  tipoEmissaoDescricao: string;
  codigoNumerico: string;
  dv: string;
  dvCalculado: string;
  dvValido: boolean;
  erro?: string;
}

const UF_MAP: Record<string, { sigla: string; nome: string }> = {
  '11': { sigla: 'RO', nome: 'Rondônia' },
  '12': { sigla: 'AC', nome: 'Acre' },
  '13': { sigla: 'AM', nome: 'Amazonas' },
  '14': { sigla: 'RR', nome: 'Roraima' },
  '15': { sigla: 'PA', nome: 'Pará' },
  '16': { sigla: 'AP', nome: 'Amapá' },
  '17': { sigla: 'TO', nome: 'Tocantins' },
  '21': { sigla: 'MA', nome: 'Maranhão' },
  '22': { sigla: 'PI', nome: 'Piauí' },
  '23': { sigla: 'CE', nome: 'Ceará' },
  '24': { sigla: 'RN', nome: 'Rio Grande do Norte' },
  '25': { sigla: 'PB', nome: 'Paraíba' },
  '26': { sigla: 'PE', nome: 'Pernambuco' },
  '27': { sigla: 'AL', nome: 'Alagoas' },
  '28': { sigla: 'SE', nome: 'Sergipe' },
  '29': { sigla: 'BA', nome: 'Bahia' },
  '31': { sigla: 'MG', nome: 'Minas Gerais' },
  '32': { sigla: 'ES', nome: 'Espírito Santo' },
  '33': { sigla: 'RJ', nome: 'Rio de Janeiro' },
  '35': { sigla: 'SP', nome: 'São Paulo' },
  '41': { sigla: 'PR', nome: 'Paraná' },
  '42': { sigla: 'SC', nome: 'Santa Catarina' },
  '43': { sigla: 'RS', nome: 'Rio Grande do Sul' },
  '50': { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  '51': { sigla: 'MT', nome: 'Mato Grosso' },
  '52': { sigla: 'GO', nome: 'Goiás' },
  '53': { sigla: 'DF', nome: 'Distrito Federal' },
};

const TP_EMIS_MAP: Record<string, string> = {
  '1': 'Emissão normal (não em contingência)',
  '2': 'Contingência FS-IA (Formulário de Segurança)',
  '3': 'Contingência SCAN (Sistema de Contingência do Ambiente Nacional)',
  '4': 'Contingência DPEC (Declaração Prévia de Emissão em Contingência)',
  '5': 'Contingência FS-DA (Formulário de Segurança para DANFE)',
  '6': 'Contingência SVC-AN (SEFAZ Virtual de Contingência do AN)',
  '7': 'Contingência SVC-RS (SEFAZ Virtual de Contingência do RS)',
  '9': 'Contingência off-line da NFC-e',
};

export function calcularDvNFe(chave43: string): string {
  let soma = 0;
  let peso = 2;
  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += parseInt(chave43[i], 10) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  const dv = resto === 0 || resto === 1 ? 0 : 11 - resto;
  return dv.toString();
}

export function formatarCnpj(cnpj: string): string {
  const c = cnpj.replace(/\D/g, '').padStart(14, '0');
  return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatarNumeroNF(numero: string): string {
  const numInt = parseInt(numero, 10);
  if (isNaN(numInt)) return numero;
  return new Intl.NumberFormat('pt-BR').format(numInt);
}

export function decodificarChaveAcesso(rawKey: string): DecodedKeyInfo {
  const chave = rawKey.replace(/\D/g, '').trim();

  if (chave.length !== 44) {
    return {
      chave,
      valida: false,
      ufCodigo: '',
      ufSigla: '',
      ufNome: '',
      anoMes: '',
      ano: '',
      mes: '',
      cnpj: '',
      cnpjFormatado: '',
      modelo: '',
      modeloDescricao: '',
      serie: '',
      numeroNF: '',
      numeroNFFormatado: '',
      tipoEmissao: '',
      tipoEmissaoDescricao: '',
      codigoNumerico: '',
      dv: '',
      dvCalculado: '',
      dvValido: false,
      erro: `Chave possui ${chave.length} dígitos. A chave oficial da NF-e deve ter exatamente 44 dígitos.`,
    };
  }

  const ufCodigo = chave.substring(0, 2);
  const anoStr = chave.substring(2, 4);
  const mesStr = chave.substring(4, 6);
  const cnpjRaw = chave.substring(6, 20);
  const modelo = chave.substring(20, 22);
  const serieRaw = chave.substring(22, 25);
  const nNFRaw = chave.substring(25, 34);
  const tpEmisRaw = chave.substring(34, 35);
  const cNFRaw = chave.substring(35, 43);
  const dvRaw = chave.substring(43, 44);

  const ufInfo = UF_MAP[ufCodigo] || { sigla: 'UF ' + ufCodigo, nome: 'Estado Desconhecido' };
  const dvCalculado = calcularDvNFe(chave.substring(0, 43));
  const dvValido = dvRaw === dvCalculado;

  const modeloDescricao =
    modelo === '55'
      ? 'NF-e (Nota Fiscal Eletrônica - Modelo 55)'
      : modelo === '65'
      ? 'NFC-e (Nota Fiscal de Consumidor Eletrônica - Modelo 65)'
      : `Modelo ${modelo}`;

  const tipoEmissaoDescricao = TP_EMIS_MAP[tpEmisRaw] || `Tipo ${tpEmisRaw}`;
  const serie = parseInt(serieRaw, 10).toString();
  const numeroNF = parseInt(nNFRaw, 10).toString();
  const numeroNFFormatado = formatarNumeroNF(nNFRaw);

  return {
    chave,
    valida: dvValido,
    ufCodigo,
    ufSigla: ufInfo.sigla,
    ufNome: ufInfo.nome,
    anoMes: `${mesStr}/20${anoStr}`,
    ano: `20${anoStr}`,
    mes: mesStr,
    cnpj: cnpjRaw,
    cnpjFormatado: formatarCnpj(cnpjRaw),
    modelo,
    modeloDescricao,
    serie,
    numeroNF,
    numeroNFFormatado,
    tipoEmissao: tpEmisRaw,
    tipoEmissaoDescricao,
    codigoNumerico: cNFRaw,
    dv: dvRaw,
    dvCalculado,
    dvValido,
  };
}
