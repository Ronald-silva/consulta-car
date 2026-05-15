/** Textos jurídicos e disclaimers para as features */
export const LEGAL_TEXTS = {
  // LGPD
  lgpdDisclaimer: `
PROTEÇÃO DE DADOS (LGPD): Seus dados são armazenados localmente no dispositivo e utilizados apenas para as funcionalidades do app. 
Não compartilhamos informações pessoais com terceiros sem seu consentimento explícito. 
Você pode excluir seus dados a qualquer momento nas configurações do aplicativo.
  `.trim(),

  // Disclaimer geral
  generalDisclaimer: `
IMPORTANTE: Este aplicativo é uma ferramenta de auxílio e não substitui a consulta oficial aos órgãos competentes. 
As informações apresentadas têm caráter informativo e podem conter imprecisões. 
Sempre confirme os dados nos sites oficiais dos órgãos de trânsito. 
O usuário é responsável pela veracidade das informações fornecidas e pelo uso adequado do aplicativo.
  `.trim(),

  // Disclaimer para recursos
  recursoDisclaimer: `
ATENÇÃO JURÍDICA: Este recurso é gerado automaticamente com base em dados fornecidos pelo usuário e jurisprudência comum. 
NÃO substitui a orientação de um advogado especializado. 
Recomendamos sempre a revisão por profissional habilitado antes da apresentação aos órgãos competentes. 
O usuário assume total responsabilidade pelo conteúdo e uso do documento gerado.
  `.trim(),

  // Disclaimer para calculadora
  calculatorDisclaimer: `
AVISO LEGAL: Os cálculos são estimativos baseados em regras gerais do SNE e jurisprudência comum. 
Sempre confirme informações nos portais oficiais dos órgãos de trânsito. 
A probabilidade de recurso é baseada em dados históricos e pode variar conforme o caso específico. 
Este app não substitui orientação jurídica profissional.
  `.trim(),

  // Textos para fundamentação de recursos
  fundamentacaoComum: {
    radar: [
      'Ausência de sinalização adequada conforme Resolução CONTRAN nº 798/2020',
      'Falta de comprovação da calibração do equipamento',
      'Não observância da margem de tolerância prevista em lei',
      'Ausência de laudo metrológico válido do equipamento',
    ],
    velocidade: [
      'Velocidade aferida dentro da margem de tolerância',
      'Condições climáticas adversas no momento da infração',
      'Sinalização inadequada ou inexistente no local',
      'Erro na identificação do veículo autuado',
    ],
    estacionamento: [
      'Ausência de sinalização clara e visível',
      'Vaga não regulamentada adequadamente',
      'Situação de emergência ou força maior',
      'Erro na identificação da placa do veículo',
    ],
    documental: [
      'Vício na notificação da autuação',
      'Ausência de elementos essenciais no auto de infração',
      'Não observância do devido processo legal',
      'Prescrição da pretensão punitiva',
    ],
  },

  // Checklist de documentos
  documentosRecurso: {
    defesaPrevia: [
      'Cópia da CNH do condutor',
      'Cópia do CRLV do veículo',
      'Fotos do local da infração (se aplicável)',
      'Comprovante de calibração do radar (solicitar ao órgão)',
      'Laudo técnico (se necessário)',
    ],
    recursoJari: [
      'Cópia da decisão da defesa prévia',
      'Cópia da CNH do condutor',
      'Cópia do CRLV do veículo',
      'Documentos que comprovem a tese de defesa',
      'Jurisprudência favorável (se houver)',
    ],
  },

  // Modelos de texto para recursos
  modelosRecurso: {
    introducao: `
Excelentíssimo(a) Senhor(a) Presidente da Junta Administrativa de Recursos de Infrações - JARI,

[NOME DO REQUERENTE], brasileiro(a), portador(a) da CNH nº [NUMERO_CNH], vem, respeitosamente, à presença de Vossa Excelência, apresentar RECURSO contra o Auto de Infração nº [NUMERO_AUTO], pelos fundamentos de fato e de direito a seguir expostos:
    `.trim(),

    fundamentosLegais: `
DOS FUNDAMENTOS LEGAIS:

O Código de Trânsito Brasileiro, em seu artigo 280, estabelece os requisitos essenciais do auto de infração, sendo nulo aquele que não os observar.

A Resolução CONTRAN nº 798/2020 regulamenta a fiscalização de velocidade e estabelece critérios técnicos obrigatórios para a validade da autuação.

O princípio da legalidade, previsto no art. 5º, II da Constituição Federal, exige que toda penalidade seja aplicada em estrita observância à lei.
    `.trim(),

    pedidos: `
DOS PEDIDOS:

Diante do exposto, requer-se:

a) O conhecimento e provimento do presente recurso;
b) A anulação do Auto de Infração nº [NUMERO_AUTO];
c) O cancelamento da pontuação na CNH;
d) A não cobrança do valor da multa.

Termos em que pede deferimento.

[CIDADE], [DATA]

_________________________________
[NOME DO REQUERENTE]
    `.trim(),
  },
} as const;