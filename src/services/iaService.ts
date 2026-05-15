import type { OcrData, InmetroResult, IaAnalysis, Multa } from '../types';

/** Configurações da API */
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/** Prompt otimizado para análise jurídica de multas de trânsito */
const LEGAL_ANALYSIS_PROMPT = `
Você é um especialista em direito de trânsito brasileiro com vasta experiência em recursos de multas.

Analise os dados da multa fornecidos e identifique possíveis argumentos de defesa baseados em:

1. **ASPECTOS FORMAIS:**
   - Vícios no auto de infração (art. 280 CTB)
   - Ausência de elementos essenciais
   - Problemas na notificação
   - Prescrição (art. 281 CTB)

2. **ASPECTOS TÉCNICOS (RADARES):**
   - Calibração e aferição do equipamento
   - Certificação Inmetro
   - Sinalização adequada (Resolução CONTRAN 798/2020)
   - Margem de tolerância

3. **ASPECTOS MATERIAIS:**
   - Condições do local
   - Visibilidade da sinalização
   - Situações excepcionais
   - Erro na identificação do veículo

4. **JURISPRUDÊNCIA COMUM:**
   - Precedentes favoráveis
   - Súmulas dos tribunais
   - Decisões administrativas

Para cada argumento identificado, classifique a força como:
- FORTE: Alta probabilidade de sucesso
- MÉDIO: Probabilidade moderada
- FRACO: Baixa probabilidade, mas válido

Forneça também:
- Probabilidade geral de sucesso (0-100%)
- Texto base para o recurso
- Recomendações específicas
- Riscos e cuidados

Seja preciso, técnico e baseado na legislação vigente.
`;

/** Analisar multa com IA */
export async function analyzeMultaWithIA(
  ocrData: OcrData,
  inmetroResult?: InmetroResult,
  apiKey?: string
): Promise<IaAnalysis> {
  if (!apiKey) {
    throw new Error('Chave da API Gemini não configurada');
  }

  try {
    const prompt = buildAnalysisPrompt(ocrData, inmetroResult);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('Resposta inválida da IA');
    }

    return parseIaResponse(aiResponse);
  } catch (error) {
    console.error('Erro na análise com IA:', error);
    
    // Fallback: análise básica sem IA
    return generateBasicAnalysis(ocrData, inmetroResult);
  }
}

/** Construir prompt personalizado */
function buildAnalysisPrompt(ocrData: OcrData, inmetroResult?: InmetroResult): string {
  let prompt = LEGAL_ANALYSIS_PROMPT + '\n\n**DADOS DA MULTA:**\n';
  
  prompt += `- Número do Auto: ${ocrData.numeroAuto}\n`;
  prompt += `- Placa: ${ocrData.placa}\n`;
  prompt += `- Data/Hora: ${ocrData.dataInfracao} ${ocrData.horaInfracao || ''}\n`;
  prompt += `- Local: ${ocrData.local}\n`;
  prompt += `- Órgão: ${ocrData.orgaoAutuador}\n`;
  prompt += `- Código: ${ocrData.codigoInfracao}\n`;
  prompt += `- Descrição: ${ocrData.descricaoInfracao}\n`;
  prompt += `- Valor: R$ ${ocrData.valor}\n`;

  if (ocrData.equipamento) {
    prompt += `- Equipamento: ${ocrData.equipamento}\n`;
  }

  if (ocrData.velocidadePermitida && ocrData.velocidadeAferida) {
    prompt += `- Velocidade Permitida: ${ocrData.velocidadePermitida} km/h\n`;
    prompt += `- Velocidade Aferida: ${ocrData.velocidadeAferida} km/h\n`;
  }

  if (inmetroResult) {
    prompt += `\n**VERIFICAÇÃO INMETRO:**\n`;
    prompt += `- Status: ${inmetroResult.status}\n`;
    if (inmetroResult.observacoes) {
      prompt += `- Observações: ${inmetroResult.observacoes}\n`;
    }
  }

  prompt += `\n**INSTRUÇÕES:**
Responda em formato JSON estruturado com:
{
  "argumentos": [
    {
      "tipo": "string",
      "forca": "forte|medio|fraco",
      "descricao": "string",
      "fundamentacao": "string"
    }
  ],
  "probabilidadeSuccesso": number,
  "textoBase": "string",
  "recomendacoes": ["string"],
  "riscos": ["string"]
}`;

  return prompt;
}

/** Parsear resposta da IA */
function parseIaResponse(response: string): IaAnalysis {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validar estrutura
      if (parsed.argumentos && Array.isArray(parsed.argumentos)) {
        return {
          argumentos: parsed.argumentos,
          probabilidadeSuccesso: parsed.probabilidadeSuccesso || 0.3,
          textoBase: parsed.textoBase || '',
          recomendacoes: parsed.recomendacoes || [],
          riscos: parsed.riscos || [],
        };
      }
    }

    // Se não conseguir parsear JSON, extrair manualmente
    return extractAnalysisFromText(response);
  } catch (error) {
    console.error('Erro ao parsear resposta da IA:', error);
    throw new Error('Resposta da IA em formato inválido');
  }
}

/** Extrair análise de texto livre */
function extractAnalysisFromText(text: string): IaAnalysis {
  const argumentos = [];
  const recomendacoes = [];
  const riscos = [];

  // Extrair argumentos (implementação básica)
  const argumentoMatches = text.match(/(?:argumento|defesa)[^.]*[.]/gi);
  if (argumentoMatches) {
    argumentoMatches.forEach((match, index) => {
      argumentos.push({
        tipo: `Argumento ${index + 1}`,
        forca: 'medio' as const,
        descricao: match.trim(),
        fundamentacao: 'Baseado na análise do texto',
      });
    });
  }

  // Extrair probabilidade
  const probMatch = text.match(/([0-9]{1,3})%/);
  const probabilidadeSuccesso = probMatch ? parseInt(probMatch[1]) / 100 : 0.3;

  return {
    argumentos,
    probabilidadeSuccesso,
    textoBase: text,
    recomendacoes,
    riscos,
  };
}

/** Análise básica sem IA (fallback) */
function generateBasicAnalysis(
  ocrData: OcrData,
  inmetroResult?: InmetroResult
): IaAnalysis {
  const argumentos = [];

  // Verificar problemas comuns
  if (inmetroResult?.status === 'irregular' || inmetroResult?.status === 'reprovado') {
    argumentos.push({
      tipo: 'Equipamento Irregular',
      forca: 'forte' as const,
      descricao: 'Equipamento de medição não aprovado ou irregular no Inmetro',
      fundamentacao: 'Resolução CONTRAN 798/2020 e Portaria Inmetro',
    });
  }

  if (ocrData.velocidadePermitida && ocrData.velocidadeAferida) {
    const permitida = parseInt(ocrData.velocidadePermitida);
    const aferida = parseInt(ocrData.velocidadeAferida);
    const excesso = ((aferida - permitida) / permitida) * 100;

    if (excesso < 20) {
      argumentos.push({
        tipo: 'Margem de Tolerância',
        forca: 'medio' as const,
        descricao: 'Velocidade dentro da margem de tolerância técnica',
        fundamentacao: 'Resolução CONTRAN 396/2011',
      });
    }
  }

  // Argumentos genéricos
  argumentos.push({
    tipo: 'Vícios Formais',
    forca: 'medio' as const,
    descricao: 'Verificar elementos essenciais do auto de infração',
    fundamentacao: 'Art. 280 do Código de Trânsito Brasileiro',
  });

  return {
    argumentos,
    probabilidadeSuccesso: 0.4,
    textoBase: 'Análise básica gerada automaticamente. Recomenda-se revisão jurídica.',
    recomendacoes: [
      'Verificar sinalização no local da infração',
      'Solicitar laudo de calibração do equipamento',
      'Consultar advogado especializado',
    ],
    riscos: [
      'Recurso pode ser indeferido se mal fundamentado',
      'Prazo para recurso é limitado',
    ],
  };
}

/** Gerar texto do recurso */
export async function generateRecursoText(
  analysis: IaAnalysis,
  recorrenteNome: string,
  numeroAuto: string,
  argumentosSelecionados: string[]
): Promise<string> {
  const argumentosTexto = analysis.argumentos
    .filter(arg => argumentosSelecionados.includes(arg.tipo))
    .map(arg => `- ${arg.descricao}\n  Fundamentação: ${arg.fundamentacao}`)
    .join('\n\n');

  return `
RECURSO DE MULTA DE TRÂNSITO

Recorrente: ${recorrenteNome}
Auto de Infração: ${numeroAuto}

DOS FATOS:

O recorrente vem, respeitosamente, apresentar recurso contra o auto de infração em epígrafe, pelos fundamentos a seguir expostos.

DOS FUNDAMENTOS JURÍDICOS:

${argumentosTexto}

DO PEDIDO:

Diante do exposto, requer-se:
a) O conhecimento e provimento do presente recurso;
b) A anulação do auto de infração;
c) O cancelamento da pontuação na CNH;
d) A não cobrança do valor da multa.

Termos em que pede deferimento.

${new Date().toLocaleDateString('pt-BR')}

_________________________________
${recorrenteNome}
  `.trim();
}