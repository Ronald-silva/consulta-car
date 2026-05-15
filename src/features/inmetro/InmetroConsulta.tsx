import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  History,
  MapPin,
  Calendar,
  Ruler,
  Gauge,
  Zap,
  FileText,
  ChevronRight,
  Loader2,
  Plus,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useInmetroStore } from './inmetroStore';
import { LegalDisclaimer } from '../../components/LegalDisclaimer';
import { openGovBrUrl } from '../../services/govIntegrationService';

const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

const TIPOS_EQUIPAMENTO = [
  'Radar fixo', 'Radar móvel', 'Radar portátil', 'Câmera de segurança', 
  'Lombada eletrônica', 'Sensor de velocidade'
];

interface InmetroConsultaProps {
  open: boolean;
  onClose: () => void;
  onUseInRecurso?: (data: any) => void;
}

type ViewMode = 'form' | 'resultado' | 'historico';

export function InmetroConsulta({ open, onClose, onUseInRecurso }: InmetroConsultaProps) {
  const { 
    consultasRealizadas, 
    consultaAtual, 
    isLoading, 
    error,
    consultarEquipamento,
    salvarConsulta,
    limparErro,
    setConsultaAtual
  } = useInmetroStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [formData, setFormData] = useState({
    uf: '',
    municipio: '',
    tipoEquipamento: '',
    numeroInmetro: '',
    local: ''
  });

  const handleClose = () => {
    setViewMode('form');
    setFormData({
      uf: '',
      municipio: '',
      tipoEquipamento: '',
      numeroInmetro: '',
      local: ''
    });
    limparErro();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await consultarEquipamento(formData);
    setViewMode('resultado');
  };

  const handleReset = () => {
    setConsultaAtual(null);
    setViewMode('form');
    setFormData({
      uf: '',
      municipio: '',
      tipoEquipamento: '',
      numeroInmetro: '',
      local: ''
    });
  };

  const municipiosPorUF = useMemo(() => {
    if (!formData.uf) return [];
    const mockMunicipios: Record<string, string[]> = {
      'SP': ['São Paulo', 'Campinas', 'Guarulhos', 'São Bernardo do Campo', 'Santo André'],
      'RJ': ['Rio de Janeiro', 'Niterói', 'São Gonçalo', 'Duque de Caxias'],
      'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Betim'],
      'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
      'PR': ['Curitiba', 'Londrina', 'Maringá'],
      'DF': ['Brasília'],
      'SC': ['Florianópolis', 'Joinville', 'Blumenau']
    };
    return mockMunicipios[formData.uf] || ['Município 1', 'Município 2', 'Município 3'];
  }, [formData.uf]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-5xl max-h-[95vh] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-ink/8 bg-gradient-to-r from-blue-50/80 to-surface backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 shrink-0">
              <Search size={20} md:size={24} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-xl font-bold text-ink truncate">
                Consulta de Radares - INMETRO
              </h2>
              <p className="text-xs md:text-sm text-muted truncate">
                Verifique a situação de equipamentos de medição de velocidade
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navegação entre views - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-canvas/50 p-1 rounded-xl border border-ink/5">
              <button
                onClick={() => setViewMode('form')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  viewMode === 'form'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                <Search size={16} />
                Consulta
              </button>
              {consultasRealizadas.length > 0 && (
                <button
                  onClick={() => setViewMode('historico')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                    viewMode === 'historico'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  <History size={16} />
                  Histórico
                </button>
              )}
            </div>
            
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink transition-all hover:scale-105 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navegação Mobile */}
        <div className="md:hidden flex items-center gap-1 p-3 border-b border-ink/8 bg-canvas/30">
          <button
            onClick={() => setViewMode('form')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'form'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <Search size={16} />
            Consulta
          </button>
          {consultasRealizadas.length > 0 && (
            <button
              onClick={() => setViewMode('historico')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'historico'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <History size={16} />
              Histórico
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 md:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-600 shrink-0" />
              <p className="text-red-800 font-semibold">Erro</p>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </motion.div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-safe-nav">
          {viewMode === 'form' && (
            <FormContent
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              municipios={municipiosPorUF}
            />
          )}
          
          {viewMode === 'resultado' && consultaAtual && (
            <ResultadoContent
              equipamento={consultaAtual}
              onReset={handleReset}
              onUseInRecurso={onUseInRecurso}
            />
          )}
          
          {viewMode === 'historico' && (
            <HistoricoContent
              consultas={consultasRealizadas}
              onSelecionarConsulta={(consulta) => {
                setFormData({
                  uf: consulta.uf,
                  municipio: consulta.municipio,
                  tipoEquipamento: consulta.tipoEquipamento,
                  numeroInmetro: consulta.numeroInmetro,
                  local: consulta.local
                });
                consultarEquipamento({
                  uf: consulta.uf,
                  municipio: consulta.municipio,
                  tipoEquipamento: consulta.tipoEquipamento,
                  numeroInmetro: consulta.numeroInmetro,
                  local: consulta.local
                });
                setViewMode('resultado');
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

function FormContent({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  municipios
}: {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  municipios: string[];
}) {
  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-4 md:mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 shadow-lg shadow-blue-500/20"
        >
          <ShieldAlert size={32} md:size={40} strokeWidth={2} />
        </motion.div>
        <h3 className="text-xl md:text-2xl font-bold text-ink mb-2 md:mb-3">Por que verificar o INMETRO?</h3>
        <p className="text-sm md:text-base text-muted max-w-2xl mx-auto leading-relaxed">
          Equipamentos de medição de velocidade devem ser aferidos regularmente pelo INMETRO. 
          Verifique a situação antes de recorrer de uma multa.
        </p>
      </div>

      {/* Formulário */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={onSubmit}
        className="max-w-2xl mx-auto space-y-4 md:space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* UF */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              <MapPin size={16} className="text-muted" />
              UF
            </label>
            <select
              value={formData.uf}
              onChange={(e) => setFormData({ ...formData, uf: e.target.value, municipio: '' })}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              required
            >
              <option value="">Selecione a UF</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          {/* Município */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              <MapPin size={16} className="text-muted" />
              Município
            </label>
            {formData.uf && municipios.length > 0 ? (
              <select
                value={formData.municipio}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              >
                <option value="">Selecione o município</option>
                {municipios.map((municipio) => (
                  <option key={municipio} value={municipio}>{municipio}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.municipio}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                placeholder="Digite o município"
                className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            )}
          </div>

          {/* Tipo de Equipamento */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              <Gauge size={16} className="text-muted" />
              Tipo de Equipamento
            </label>
            <select
              value={formData.tipoEquipamento}
              onChange={(e) => setFormData({ ...formData, tipoEquipamento: e.target.value })}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            >
              <option value="">Selecione o tipo</option>
              {TIPOS_EQUIPAMENTO.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Número Inmetro */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              <FileText size={16} className="text-muted" />
              Número INMETRO (opcional)
            </label>
            <input
              type="text"
              value={formData.numeroInmetro}
              onChange={(e) => setFormData({ ...formData, numeroInmetro: e.target.value })}
              placeholder="Ex: 1234.56.78.901.23"
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>

        {/* Local / Via / KM */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink flex items-center gap-2">
            <Ruler size={16} className="text-muted" />
            Local / Via / KM (opcional)
          </label>
          <input
            type="text"
            value={formData.local}
            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
            placeholder="Ex: BR-116, KM 145,8"
            className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Botão de Busca */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <Search size={24} />
              Consultar Radar
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Info Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h5 className="font-semibold text-blue-800 mb-1">Dica Importante</h5>
              <p className="text-sm text-blue-700 leading-relaxed">
                Se você tem uma multa, verifique o número do equipamento na notificação. 
                Equipamentos com aferição vencida ou reprovada podem ser argumentos válidos para recurso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultadoContent({
  equipamento,
  onReset,
  onUseInRecurso
}: {
  equipamento: any;
  onReset: () => void;
  onUseInRecurso?: (data: any) => void;
}) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'valido':
        return {
          color: 'green',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: CheckCircle2,
          label: 'Aferido e Válido'
        };
      case 'vencido':
        return {
          color: 'amber',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: Clock,
          label: 'Aferição Vencida'
        };
      case 'reprovado':
        return {
          color: 'red',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: AlertTriangle,
          label: 'Reprovado / Irregular'
        };
      default:
        return {
          color: 'gray',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: Clock,
          label: 'Sem verificação recente'
        };
    }
  };

  const statusConfig = getStatusConfig(equipamento.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${statusConfig.bg} ${statusConfig.border} rounded-2xl p-6 md:p-8`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-${statusConfig.color}-100 text-${statusConfig.color}-600 shadow-lg`}>
              <StatusIcon size={32} md:size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-ink mb-1">
                {equipamento.tipoEquipamento}
              </h3>
              <p className={`text-sm md:text-base font-semibold ${statusConfig.text}`}>
                {statusConfig.label}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openGovBrUrl('inmetro')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-ink/10 text-ink font-semibold rounded-xl hover:bg-canvas hover:border-ink/20 hover:shadow-md transition-all"
            >
              <ExternalLink size={18} />
              Ver no site oficial
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dados do Equipamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-canvas border border-ink/8 rounded-xl p-4 md:p-6"
        >
          <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} />
            Dados do Equipamento
          </h4>
          <div className="space-y-4">
            <DetailItem label="Número INMETRO" value={equipamento.numeroInmetro} />
            <DetailItem label="Número de Série" value={equipamento.numeroSerie} />
            <DetailItem label="Tipo de Equipamento" value={equipamento.tipoEquipamento} />
            <DetailItem label="Marca / Modelo" value={equipamento.marcaModelo} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-canvas border border-ink/8 rounded-xl p-4 md:p-6"
        >
          <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar size={16} />
            Verificações
          </h4>
          <div className="space-y-4">
            <DetailItem label="Última Verificação" value={formatDate(equipamento.dataUltimaVerificacao)} />
            <DetailItem label="Validade" value={formatDate(equipamento.validade)} highlight={equipamento.status === 'vencido'} />
            <DetailItem label="Próxima Verificação" value={formatDate(equipamento.proximaVerificacao)} />
          </div>
        </motion.div>
      </div>

      {/* Localização */}
      {equipamento.local && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-canvas border border-ink/8 rounded-xl p-4 md:p-6"
        >
          <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin size={16} />
            Localização
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailItem label="UF" value={equipamento.uf} />
            <DetailItem label="Município" value={equipamento.municipio} />
            <DetailItem label="Local / Via" value={equipamento.local} />
          </div>
        </motion.div>
      )}

      {/* Histórico de Verificações */}
      {equipamento.historico && equipamento.historico.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-canvas border border-ink/8 rounded-xl p-4 md:p-6"
        >
          <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <History size={16} />
            Últimas 5 Verificações
          </h4>
          <div className="space-y-3">
            {equipamento.historico.map((item: any, index: number) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-canvas/50 rounded-lg border border-ink/5 hover:bg-canvas hover:border-ink/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    item.status === 'aprovado' ? 'bg-green-100 text-green-600' :
                    item.status === 'reprovado' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status === 'aprovado' ? <CheckCircle2 size={16} /> :
                     item.status === 'reprovado' ? <AlertTriangle size={16} /> :
                     <Clock size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{formatDate(item.data)}</p>
                    <p className="text-xs text-muted capitalize">{item.status === 'aprovado' ? 'Aprovado' : item.status === 'reprovado' ? 'Reprovado' : 'Pendente'}</p>
                  </div>
                </div>
                <p className="text-sm font-mono text-ink">{item.numeroOrdem}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-ink/8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-ink/15 text-ink font-semibold rounded-xl hover:bg-canvas hover:border-ink/25 transition-all"
        >
          <Search size={20} />
          Nova Consulta
        </motion.button>
        
        {onUseInRecurso && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onUseInRecurso(equipamento)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand to-brand-emphasis text-white font-semibold rounded-xl shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/35 transition-all"
          >
            <Zap size={20} />
            Usar este radar no Recurso IA
          </motion.button>
        )}
      </div>

      {/* Legal */}
      <LegalDisclaimer
        type="info"
        title="Informações Importantes"
        content="Os dados apresentados são baseados em informações públicas do INMETRO. Sempre confirme diretamente no site oficial antes de tomar qualquer decisão. Esta consulta é informativa e não substitui aconselhamento jurídico profissional."
      />
    </div>
  );
}

function HistoricoContent({
  consultas,
  onSelecionarConsulta
}: {
  consultas: any[];
  onSelecionarConsulta: (consulta: any) => void;
}) {
  if (consultas.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <History size={40} />
        </div>
        <h3 className="text-xl font-bold text-ink mb-2">Nenhuma consulta realizada</h3>
        <p className="text-muted mb-6 max-w-md mx-auto">
          Suas consultas recentes aparecerão aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <h3 className="text-lg font-bold text-ink flex items-center gap-2">
        <History size={20} />
        Histórico de Consultas
      </h3>
      <div className="space-y-3">
        {consultas.map((consulta, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelecionarConsulta(consulta)}
            className="flex items-center justify-between p-4 bg-canvas border border-ink/8 rounded-xl hover:border-brand/30 hover:shadow-md hover:bg-brand/5 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shrink-0">
                <Search size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">
                  {consulta.tipoEquipamento || 'Equipamento'}
                </p>
                <p className="text-xs text-muted truncate">
                  {consulta.uf} {consulta.municipio ? `• ${consulta.municipio}` : ''} {consulta.numeroInmetro ? `• ${consulta.numeroInmetro}` : ''}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted group-hover:text-brand group-hover:translate-x-1 transition-all" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-red-600' : 'text-ink'}`}>
        {value || '-'}
      </p>
    </div>
  );
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
