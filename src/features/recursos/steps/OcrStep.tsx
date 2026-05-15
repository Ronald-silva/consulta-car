import React, { useEffect, useState } from 'react';
import { Eye, RefreshCw, AlertTriangle, CheckCircle2, Edit3, Zap } from 'lucide-react';
import { useRecursoStore } from '../../../stores/recursoStore';
import { extractTextFromImage, parseOcrText, validateOcrData } from '../../../services/ocrService';
import type { OcrData } from '../../../types';

export function OcrStep() {
  const { 
    uploadedFile, 
    currentRecurso, 
    setOcrData, 
    setWizardLoading, 
    setWizardError 
  } = useRecursoStore();

  const [extractedText, setExtractedText] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<OcrData>>({});
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: false, errors: [], warnings: [] });

  // Auto-extrair quando o componente carrega
  useEffect(() => {
    if (uploadedFile && !currentRecurso?.ocrData && !isExtracting) {
      handleExtractData();
    }
  }, [uploadedFile, currentRecurso?.ocrData]);

  // Validar dados quando mudarem
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      const validationResult = validateOcrData(formData);
      setValidation(validationResult);
    }
  }, [formData]);

  const handleExtractData = async () => {
    if (!uploadedFile) return;

    setIsExtracting(true);
    setWizardLoading(true);
    setWizardError(undefined);
    setOcrProgress(0);

    try {
      // Extrair texto da imagem
      const text = await extractTextFromImage(
        uploadedFile.file,
        (progress) => setOcrProgress(progress)
      );

      setExtractedText(text);

      // Parsear dados estruturados
      const parsedData = parseOcrText(text);
      setFormData(parsedData);

      // Se os dados são válidos, salvar automaticamente
      const validationResult = validateOcrData(parsedData);
      if (validationResult.isValid) {
        setOcrData(parsedData as OcrData);
      }

    } catch (error) {
      console.error('Erro na extração OCR:', error);
      setWizardError('Falha ao extrair dados da imagem. Tente novamente ou preencha manualmente.');
    } finally {
      setIsExtracting(false);
      setWizardLoading(false);
    }
  };

  const handleFieldChange = (field: keyof OcrData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
  };

  const handleSaveData = () => {
    if (validation.isValid) {
      setOcrData(formData as OcrData);
      setEditMode(false);
    }
  };

  const handleRetry = () => {
    setExtractedText('');
    setFormData({});
    setValidation({ isValid: false, errors: [], warnings: [] });
    handleExtractData();
  };

  if (!uploadedFile) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
        <p className="text-lg font-semibold text-ink mb-2">Nenhum arquivo carregado</p>
        <p className="text-muted">Volte para a etapa anterior e envie uma multa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-ink mb-3">Extração de Dados</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Nosso sistema está extraindo automaticamente os dados da sua multa. 
          Confira se as informações estão corretas e faça ajustes se necessário.
        </p>
      </div>

      {/* Status da Extração */}
      {isExtracting && (
        <div className="p-6 bg-brand-soft/20 border border-brand/20 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
              <Zap size={24} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-ink mb-1">Extraindo dados com IA...</h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-brand h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted mt-1">
                {Math.round(ocrProgress * 100)}% concluído
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados da Extração */}
      {!isExtracting && Object.keys(formData).length > 0 && (
        <div className="space-y-6">
          {/* Status de Validação */}
          <div className={`p-4 rounded-xl border ${
            validation.isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              {validation.isValid ? (
                <CheckCircle2 size={20} className="text-green-600" />
              ) : (
                <AlertTriangle size={20} className="text-amber-600" />
              )}
              <div>
                <h4 className={`font-semibold ${
                  validation.isValid ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {validation.isValid 
                    ? 'Dados extraídos com sucesso!' 
                    : 'Alguns dados precisam de atenção'
                  }
                </h4>
                {validation.errors.length > 0 && (
                  <ul className="text-sm text-amber-700 mt-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
                {validation.warnings.length > 0 && (
                  <ul className="text-sm text-amber-600 mt-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>⚠ {warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Formulário de Dados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna 1: Dados Básicos */}
            <div className="space-y-4">
              <h4 className="font-semibold text-ink flex items-center gap-2">
                <CheckCircle2 size={18} className="text-brand" />
                Dados Básicos
              </h4>

              <FormField
                label="Número do Auto *"
                value={formData.numeroAuto || ''}
                onChange={(value) => handleFieldChange('numeroAuto', value)}
                disabled={!editMode}
                required
              />

              <FormField
                label="Placa do Veículo *"
                value={formData.placa || ''}
                onChange={(value) => handleFieldChange('placa', value.toUpperCase())}
                disabled={!editMode}
                required
                maxLength={7}
              />

              <FormField
                label="Data da Infração *"
                type="date"
                value={formData.dataInfracao || ''}
                onChange={(value) => handleFieldChange('dataInfracao', value)}
                disabled={!editMode}
                required
              />

              <FormField
                label="Hora da Infração"
                type="time"
                value={formData.horaInfracao || ''}
                onChange={(value) => handleFieldChange('horaInfracao', value)}
                disabled={!editMode}
              />

              <FormField
                label="Valor da Multa *"
                type="number"
                step="0.01"
                value={formData.valor || ''}
                onChange={(value) => handleFieldChange('valor', parseFloat(value) || 0)}
                disabled={!editMode}
                required
              />
            </div>

            {/* Coluna 2: Detalhes */}
            <div className="space-y-4">
              <h4 className="font-semibold text-ink flex items-center gap-2">
                <Eye size={18} className="text-blue-500" />
                Detalhes da Infração
              </h4>

              <FormField
                label="Órgão Autuador"
                value={formData.orgaoAutuador || ''}
                onChange={(value) => handleFieldChange('orgaoAutuador', value)}
                disabled={!editMode}
              />

              <FormField
                label="Código da Infração"
                value={formData.codigoInfracao || ''}
                onChange={(value) => handleFieldChange('codigoInfracao', value)}
                disabled={!editMode}
              />

              <FormField
                label="Descrição da Infração"
                value={formData.descricaoInfracao || ''}
                onChange={(value) => handleFieldChange('descricaoInfracao', value)}
                disabled={!editMode}
                multiline
              />

              <FormField
                label="Local da Infração"
                value={formData.local || ''}
                onChange={(value) => handleFieldChange('local', value)}
                disabled={!editMode}
                multiline
              />

              <FormField
                label="Equipamento"
                value={formData.equipamento || ''}
                onChange={(value) => handleFieldChange('equipamento', value)}
                disabled={!editMode}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Vel. Permitida"
                  value={formData.velocidadePermitida || ''}
                  onChange={(value) => handleFieldChange('velocidadePermitida', value)}
                  disabled={!editMode}
                  placeholder="km/h"
                />

                <FormField
                  label="Vel. Aferida"
                  value={formData.velocidadeAferida || ''}
                  onChange={(value) => handleFieldChange('velocidadeAferida', value)}
                  disabled={!editMode}
                  placeholder="km/h"
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-center gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand border border-brand rounded-lg hover:bg-brand-soft/30 transition"
                >
                  <Edit3 size={16} />
                  Editar Dados
                </button>

                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted border border-ink/20 rounded-lg hover:bg-canvas transition"
                >
                  <RefreshCw size={16} />
                  Extrair Novamente
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 text-sm font-semibold text-muted border border-ink/20 rounded-lg hover:bg-canvas transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSaveData}
                  disabled={!validation.isValid}
                  className="px-6 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-emphasis disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Salvar Alterações
                </button>
              </>
            )}
          </div>

          {/* Texto Extraído (Collapsible) */}
          {extractedText && (
            <details className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                Ver texto extraído (OCR)
              </summary>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border overflow-auto max-h-40">
                {extractedText}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Estado Inicial */}
      {!isExtracting && Object.keys(formData).length === 0 && (
        <div className="text-center py-12">
          <button
            onClick={handleExtractData}
            className="flex items-center gap-3 mx-auto px-8 py-4 bg-brand text-white rounded-2xl font-semibold text-lg hover:bg-brand-emphasis transition shadow-lg"
          >
            <Zap size={24} />
            Extrair Dados Automaticamente
          </button>
          <p className="text-muted mt-4">
            Clique para iniciar a extração automática dos dados da multa
          </p>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  type = 'text',
  multiline = false,
  placeholder,
  maxLength,
  step,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
  step?: string;
}) {
  const Component = multiline ? 'textarea' : 'input';
  
  return (
    <div>
      <label className="block text-sm font-semibold text-ink mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Component
        type={multiline ? undefined : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        step={step}
        rows={multiline ? 3 : undefined}
        className={`w-full px-3 py-2 border rounded-lg outline-none transition ${
          disabled
            ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed'
            : 'border-ink/20 focus:border-brand focus:ring-1 focus:ring-brand/20'
        }`}
      />
    </div>
  );
}