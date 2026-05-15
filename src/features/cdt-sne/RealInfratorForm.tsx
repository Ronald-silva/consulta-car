import React, { useState } from 'react';
import { 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Send,
  Loader2,
  FileText,
  Calendar,
  User,
  CreditCard,
  IdCard
} from 'lucide-react';
import { useCDTSNEStore } from '../../stores/cdtSneStore';
import { submitRealInfrator, validateCPF, formatCPF, formatCNH } from '../../services/govIntegrationService';

interface RealInfratorFormProps {
  onBack: () => void;
}

interface FormData {
  numeroAuto: string;
  placa: string;
  nomeInfrator: string;
  cpfInfrator: string;
  cnhInfrator: string;
  observacoes: string;
}

const initialFormData: FormData = {
  numeroAuto: '',
  placa: '',
  nomeInfrator: '',
  cpfInfrator: '',
  cnhInfrator: '',
  observacoes: '',
};

export function RealInfratorForm({ onBack }: RealInfratorFormProps) {
  const { 
    multasImportadas, 
    indicacoesRealInfrator,
    addIndicacaoRealInfrator,
    setLoading,
    setError,
    clearError,
    isLoading,
    error
  } = useCDTSNEStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedMulta, setSelectedMulta] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Partial<FormData>>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleMultaSelect = (multaId: string) => {
    const multa = multasImportadas.find(m => m.id === multaId);
    if (multa) {
      setSelectedMulta(multaId);
      setFormData(prev => ({
        ...prev,
        numeroAuto: multa.numeroAuto,
        placa: multa.placa,
      }));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.numeroAuto.trim()) {
      errors.numeroAuto = 'Número do auto de infração é obrigatório';
    }

    if (!formData.placa.trim()) {
      errors.placa = 'Placa é obrigatória';
    }

    if (!formData.nomeInfrator.trim()) {
      errors.nomeInfrator = 'Nome do real infrator é obrigatório';
    }

    if (!formData.cpfInfrator.trim()) {
      errors.cpfInfrator = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpfInfrator)) {
      errors.cpfInfrator = 'CPF inválido';
    }

    if (!formData.cnhInfrator.trim()) {
      errors.cnhInfrator = 'CNH é obrigatória';
    } else if (formData.cnhInfrator.replace(/\D/g, '').length !== 11) {
      errors.cnhInfrator = 'CNH deve ter 11 dígitos';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    clearError();
    setSubmitSuccess(null);

    try {
      const result = await submitRealInfrator('mock_token', {
        numeroAuto: formData.numeroAuto,
        placa: formData.placa,
        nomeInfrator: formData.nomeInfrator,
        cpfInfrator: formData.cpfInfrator.replace(/\D/g, ''),
        cnhInfrator: formData.cnhInfrator.replace(/\D/g, ''),
        observacoes: formData.observacoes,
      });

      if (result.success) {
        addIndicacaoRealInfrator({
          numeroAuto: formData.numeroAuto,
          placa: formData.placa,
          nomeInfrator: formData.nomeInfrator,
          cpfInfrator: formData.cpfInfrator.replace(/\D/g, ''),
          cnhInfrator: formData.cnhInfrator.replace(/\D/g, ''),
          observacoes: formData.observacoes,
        });

        setSubmitSuccess(`Indicação enviada com sucesso! Protocolo: ${result.protocolo}`);
        setFormData(initialFormData);
        setSelectedMulta('');
      } else {
        setError(result.error || 'Erro ao enviar indicação');
      }
    } catch (err) {
      setError('Erro ao enviar indicação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const multasPendentes = multasImportadas.filter(m => m.status === 'pendente');

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-muted hover:text-ink hover:bg-canvas rounded-lg transition"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        
        <div>
          <h3 className="text-2xl font-bold text-ink">Indicar Real Infrator</h3>
          <p className="text-muted">
            Indique quem realmente cometeu a infração quando você não era o condutor
          </p>
        </div>
      </div>

      {/* Informações Importantes */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Info size={20} />
          Quando usar a indicação de real infrator?
        </h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
            Quando você não era o condutor do veículo no momento da infração
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
            Quando o veículo foi emprestado para outra pessoa
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
            Em casos de uso por funcionários (veículos da empresa)
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
            Quando há erro na identificação do condutor
          </li>
        </ul>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" />
            <p className="text-green-800 font-semibold">Sucesso!</p>
          </div>
          <p className="text-green-700 text-sm mt-1">{submitSuccess}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            <p className="text-red-800 font-semibold">Erro</p>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-6">
          <div className="bg-surface border border-ink/8 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <FileText size={20} />
              Dados da Infração
            </h4>

            {/* Seleção de Multa */}
            {multasPendentes.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-2">
                  Selecionar Multa (Opcional)
                </label>
                <select
                  value={selectedMulta}
                  onChange={(e) => handleMultaSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition"
                >
                  <option value="">Selecione uma multa ou preencha manualmente</option>
                  {multasPendentes.map((multa) => (
                    <option key={multa.id} value={multa.id}>
                      {multa.placa} - {multa.numeroAuto} - {multa.descricao}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Número do Auto de Infração *
                </label>
                <input
                  type="text"
                  value={formData.numeroAuto}
                  onChange={(e) => handleInputChange('numeroAuto', e.target.value)}
                  placeholder="Ex: 40123456789"
                  className={`w-full px-4 py-3 border rounded-xl bg-surface focus:ring-1 outline-none transition ${
                    validationErrors.numeroAuto
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-ink/8 focus:border-brand focus:ring-brand/20'
                  }`}
                />
                {validationErrors.numeroAuto && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.numeroAuto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Placa do Veículo *
                </label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                  placeholder="Ex: ABC1234"
                  maxLength={8}
                  className={`w-full px-4 py-3 border rounded-xl bg-surface focus:ring-1 outline-none transition font-mono ${
                    validationErrors.placa
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-ink/8 focus:border-brand focus:ring-brand/20'
                  }`}
                />
                {validationErrors.placa && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.placa}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface border border-ink/8 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <User size={20} />
              Dados do Real Infrator
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nomeInfrator}
                  onChange={(e) => handleInputChange('nomeInfrator', e.target.value)}
                  placeholder="Nome completo do condutor"
                  className={`w-full px-4 py-3 border rounded-xl bg-surface focus:ring-1 outline-none transition ${
                    validationErrors.nomeInfrator
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-ink/8 focus:border-brand focus:ring-brand/20'
                  }`}
                />
                {validationErrors.nomeInfrator && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.nomeInfrator}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formData.cpfInfrator}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      handleInputChange('cpfInfrator', formatted);
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full px-4 py-3 border rounded-xl bg-surface focus:ring-1 outline-none transition font-mono ${
                      validationErrors.cpfInfrator
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-ink/8 focus:border-brand focus:ring-brand/20'
                    }`}
                  />
                  {validationErrors.cpfInfrator && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.cpfInfrator}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    CNH *
                  </label>
                  <input
                    type="text"
                    value={formData.cnhInfrator}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '');
                      handleInputChange('cnhInfrator', cleaned);
                    }}
                    placeholder="12345678901"
                    maxLength={11}
                    className={`w-full px-4 py-3 border rounded-xl bg-surface focus:ring-1 outline-none transition font-mono ${
                      validationErrors.cnhInfrator
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-ink/8 focus:border-brand focus:ring-brand/20'
                    }`}
                  />
                  {validationErrors.cnhInfrator && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.cnhInfrator}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Observações (Opcional)
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais sobre a situação..."
                  rows={4}
                  className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
            {isLoading ? 'Enviando Indicação...' : 'Enviar Indicação'}
          </button>
        </div>

        {/* Histórico de Indicações */}
        <div className="space-y-6">
          <div className="bg-surface border border-ink/8 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Histórico de Indicações
            </h4>

            {indicacoesRealInfrator.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="text-muted mx-auto mb-2" />
                <p className="text-muted">Nenhuma indicação realizada ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {indicacoesRealInfrator.slice(0, 5).map((indicacao) => (
                  <IndicacaoCard key={indicacao.id} indicacao={indicacao} />
                ))}
              </div>
            )}
          </div>

          {/* Informações Legais */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} />
              Informações Legais
            </h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                A indicação deve ser feita em até 15 dias da notificação
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                Informações falsas podem gerar responsabilização legal
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                O real infrator será notificado e poderá contestar
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                Mantenha comprovantes da indicação
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function IndicacaoCard({ 
  indicacao,
  key
}: { 
  indicacao: any;
  key?: string | number;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviada':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'processando':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'aceita':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejeitada':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviada':
        return <Send size={14} className="text-blue-600" />;
      case 'processando':
        return <Loader2 size={14} className="text-amber-600 animate-spin" />;
      case 'aceita':
        return <CheckCircle2 size={14} className="text-green-600" />;
      case 'rejeitada':
        return <AlertTriangle size={14} className="text-red-600" />;
      default:
        return <Info size={14} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-4 border border-ink/8 rounded-xl">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-ink text-sm">Auto: {indicacao.numeroAuto}</p>
          <p className="text-muted text-xs">Placa: {indicacao.placa}</p>
        </div>
        
        <div className={`px-2 py-1 rounded-full border text-xs font-semibold ${getStatusColor(indicacao.status)}`}>
          <div className="flex items-center gap-1">
            {getStatusIcon(indicacao.status)}
            {indicacao.status.charAt(0).toUpperCase() + indicacao.status.slice(1)}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-ink mb-1">
        <strong>Infrator:</strong> {indicacao.nomeInfrator}
      </p>
      
      <p className="text-xs text-muted">
        Enviado em: {new Date(indicacao.dataIndicacao).toLocaleDateString('pt-BR')}
      </p>
    </div>
  );
}