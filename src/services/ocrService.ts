import Tesseract from 'tesseract.js';
import type { OcrData } from '../types';

/** Configurações do OCR */
const OCR_CONFIG = {
  lang: 'por',
  options: {
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/-:.,() ',
    preserve_interword_spaces: '1',
  },
};

/** Padrões regex para extração de dados */
const PATTERNS = {
  numeroAuto: /(?:auto|infração|n[°º]?)\s*:?\s*([0-9]{8,12})/i,
  placa: /(?:placa|veículo)\s*:?\s*([A-Z]{3}[0-9][A-Z0-9][0-9]{2})/i,
  dataInfracao: /(?:data|infração)\s*:?\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i,
  horaInfracao: /(?:hora|horário)\s*:?\s*([0-9]{1,2}:[0-9]{2})/i,
  velocidadePermitida: /(?:permitida|máxima)\s*:?\s*([0-9]{2,3})\s*km/i,
  velocidadeAferida: /(?:aferida|registrada)\s*:?\s*([0-9]{2,3})\s*km/i,
  valor: /(?:valor|multa)\s*:?\s*r?\$?\s*([0-9]{1,4}[,.]?[0-9]{0,2})/i,
  codigoInfracao: /(?:código|art)\s*:?\s*([0-9]{5})/i,
  orgaoAutuador: /(?:órgão|autuador)\s*:?\s*([A-Z\s-]{3,20})/i,
};

/** Extrair texto de imagem usando Tesseract.js */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const result = await Tesseract.recognize(file, OCR_CONFIG.lang, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress);
        }
      },
    });

    return result.data.text;
  } catch (error) {
    console.error('Erro no OCR:', error);
    throw new Error('Falha ao extrair texto da imagem');
  }
}

/** Extrair dados estruturados do texto OCR */
export function parseOcrText(text: string): Partial<OcrData> {
  const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  
  const extracted: Partial<OcrData> = {
    confidence: 0.7, // Confiança base
  };

  // Extrair cada campo usando regex
  Object.entries(PATTERNS).forEach(([field, pattern]) => {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const value = match[1].trim();
      
      switch (field) {
        case 'valor':
          extracted.valor = parseFloat(value.replace(',', '.'));
          break;
        case 'placa':
          extracted.placa = value.toUpperCase().replace(/\s/g, '');
          break;
        default:
          (extracted as any)[field] = value;
      }
    }
  });

  // Tentar extrair local (mais complexo)
  const localMatch = cleanText.match(/(?:local|endereço)\s*:?\s*([^0-9]{10,100})/i);
  if (localMatch) {
    extracted.local = localMatch[1].trim();
  }

  // Tentar extrair descrição da infração
  const descricaoMatch = cleanText.match(/(?:infração|descrição)\s*:?\s*([^0-9]{10,100})/i);
  if (descricaoMatch) {
    extracted.descricaoInfracao = descricaoMatch[1].trim();
  }

  // Calcular confiança baseada nos campos extraídos
  const fieldsFound = Object.values(extracted).filter(v => v !== undefined).length;
  extracted.confidence = Math.min(0.9, fieldsFound * 0.1);

  return extracted;
}

/** Validar dados extraídos */
export function validateOcrData(data: Partial<OcrData>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações obrigatórias
  if (!data.numeroAuto) {
    errors.push('Número do auto de infração não encontrado');
  }

  if (!data.placa) {
    errors.push('Placa do veículo não encontrada');
  } else if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(data.placa)) {
    warnings.push('Formato da placa pode estar incorreto');
  }

  if (!data.dataInfracao) {
    errors.push('Data da infração não encontrada');
  }

  if (!data.valor || data.valor <= 0) {
    errors.push('Valor da multa não encontrado ou inválido');
  }

  // Validações opcionais (warnings)
  if (!data.local) {
    warnings.push('Local da infração não identificado');
  }

  if (!data.orgaoAutuador) {
    warnings.push('Órgão autuador não identificado');
  }

  if (data.confidence < 0.5) {
    warnings.push('Baixa confiança na extração dos dados');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/** Fallback para API externa (OCR.space ou Google Vision) */
export async function extractTextFromImageAPI(
  file: File,
  apiKey?: string
): Promise<string> {
  // Implementação futura para API externa
  // Por enquanto, usar apenas Tesseract.js local
  throw new Error('API externa não implementada ainda');
}

/** Extrair texto de PDF */
export async function extractTextFromPDF(file: File): Promise<string> {
  // Implementação futura para PDFs
  // Pode usar pdf-parse ou similar
  throw new Error('Extração de PDF não implementada ainda');
}