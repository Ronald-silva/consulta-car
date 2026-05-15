import React, { useState, useEffect } from 'react';
import { X, Calculator, TrendingUp, AlertTriangle, CheckCircle2, Gavel, Info, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { Multa, CalculationResult } from '../types';
import { calculateMultaResults, formatCurrency, formatPercentage, getRiskColor, getRiskText } from '../utils/calculator';
import { LegalDisclaimer } from './LegalDisclaimer';
import { LEGAL_TEXTS } from '../constants/legalTexts';

interface CalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onGenerateRecurso?: (multa: Partial<Multa>) => void;
}

export function CalculatorModal({ open, onClose, onGenerateRecurso }: CalculatorModalProps) {
  const [formData, setFormData] = useState<Partial<Multa>>({
    numeroAuto: '',
    placa: '',
    valor: 0,
    dataInfracao: '',
    dataVencimento: '',
    orgaoAutuador: '',
    codigoInfracao: '',
    descricaoInfracao: '',
    pontos: 0,
    local: '',
    equipamento: '',
    velocidadePermitida: '',
    velocidadeAferida: '',
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');

  // Recalcular quando os dados mudarem
  useEffect(() => {
    const newResult = calculateMultaResults(formData);
    setResult(newResult);
  }, [formData]);

  const updateField = (field: keyof Multa, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setFormData({
      numeroAuto: '',
      placa: '',
      valor: 0,
      dataInfracao: '',
      dataVencimento: '',
      orgaoAutuador: '',
      codigoInfracao: '',
      descricaoInfracao: '',
      pontos: 0,
      local: '',
      equipamento: '',
      velocidadePermitida: '',
      velocidadeAferida: '',
    });
    setResult(null);
    setActiveTab('form');
  };

  const handleGenerateRecurso = () => {
    if (onGenerateRecurso && formData.valor && formData.numeroAuto && formData.placa) {
      onGenerateRecurso(formData);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[95vh] bg-surface rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-ink/8 bg-gradient-to-r from-brand-soft/30 to-surface backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-emphasis text-white shadow-lg shadow-brand/25 shrink-0">
              <Calculator size={20} md:size={24} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-xl font-bold text-ink truncate">Calculadora de Economia</h2>
              <p className="text-xs md:text-sm text-muted truncate">Simule custos, descontos e probabilidade de recurso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink transition-all hover:scale-105 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ink/8 bg-canvas/30">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === 'form'
                ? 'text-brand border-b-2 border-brand bg-brand-soft/30 shadow-sm'
                : 'text-muted hover:text-ink hover:bg-canvas/50'
            }`}
          >
            <CheckCircle2 size={16} />
            Dados da Multa
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === 'results'
                ? 'text-brand border-b-2 border-brand bg-brand-soft/30 shadow-sm'
                : 'text-muted hover:text-ink hover:bg-canvas/50'
            }`}
          >
            <TrendingUp size={16} />
            Cálculos e Simulação
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[70vh] pb-safe-nav">
          {activeTab === 'form' && (
            <MultaForm formData={formData} updateField={updateField} />
          )}
          
          {activeTab === 'results' && (
            <CalculationResults result={result} onGenerateRecurso={handleGenerateRecurso} />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-t border-ink/8 bg-canvas/30 gap-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Info size={14} />
            <span>Cálculos baseados em regras atuais do SNE e jurisprudência comum</span>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={clearForm}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-muted border border-ink/20 rounded-lg hover:bg-canvas hover:text-ink hover:border-ink/30 transition-all"
            >
              Limpar
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!result}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand to-brand-emphasis rounded-lg hover:shadow-lg hover:shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Ver Resultados
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* LGPD Disclaimer */}
        <div className="px-4 md:px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
          <LegalDisclaimer
            type="lgpd"
            title="Proteção de Dados (LGPD)"
            content={LEGAL_TEXTS.lgpdDisclaimer}
            className="border-0 bg-transparent p-0"
          />
        </div>
      </motion.div>
    </div>
  );
}

function MultaForm({ 
  formData, 
  updateField,
  key
}: { 
  formData: Partial<Multa>; 
  updateField: (field: keyof Multa, value: any) => void;
  key?: string | number;
}) {
  return (
    <div className="space-y-6 pb-8">
      {/* Dados Básicos */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink mb-4">
          <CheckCircle2 size={18} className="text-brand" />
          Dados Básicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Número do Auto *
            </label>
            <input
              type="text"
              value={formData.numeroAuto || ''}
              onChange={(e) => updateField('numeroAuto', e.target.value)}
              placeholder="Ex: 123456789"
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Placa *
            </label>
            <input
              type="text"
              value={formData.placa || ''}
              onChange={(e) => updateField('placa', e.target.value.toUpperCase())}
              placeholder="ABC1234"
              maxLength={7}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Valor da Multa *
            </label>
            <input
              type="number"
              value={formData.valor || ''}
              onChange={(e) => updateField('valor', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Pontos CNH
            </label>
            <input
              type="number"
              value={formData.pontos || ''}
              onChange={(e) => updateField('pontos', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              max="20"
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Data da Infração *
            </label>
            <input
              type="date"
              value={formData.dataInfracao || ''}
              onChange={(e) => updateField('dataInfracao', e.target.value)}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={formData.dataVencimento || ''}
              onChange={(e) => updateField('dataVencimento', e.target.value)}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Detalhes da Infração */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink mb-4">
          <AlertTriangle size={18} className="text-orange-500" />
          Detalhes da Infração
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Órgão Autuador
            </label>
            <input
              type="text"
              value={formData.orgaoAutuador || ''}
              onChange={(e) => updateField('orgaoAutuador', e.target.value)}
              placeholder="Ex: DETRAN-CE, PRF, etc."
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Código da Infração
            </label>
            <input
              type="text"
              value={formData.codigoInfracao || ''}
              onChange={(e) => updateField('codigoInfracao', e.target.value)}
              placeholder="Ex: 74550"
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-mono"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Descrição da Infração
            </label>
            <textarea
              value={formData.descricaoInfracao || ''}
              onChange={(e) => updateField('descricaoInfracao', e.target.value)}
              placeholder="Ex: Excesso de velocidade"
              rows={2}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all resize-none"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Local da Infração
            </label>
            <textarea
              value={formData.local || ''}
              onChange={(e) => updateField('local', e.target.value)}
              placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
              rows={2}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all resize-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Dados do Equipamento */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink mb-4">
          <TrendingUp size={18} className="text-blue-500" />
          Equipamento (Radares)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Tipo de Equipamento
            </label>
            <input
              type="text"
              value={formData.equipamento || ''}
              onChange={(e) => updateField('equipamento', e.target.value)}
              placeholder="Ex: Radar fixo, móvel"
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Velocidade Permitida
            </label>
            <input
              type="text"
              value={formData.velocidadePermitida || ''}
              onChange={(e) => updateField('velocidadePermitida', e.target.value)}
              placeholder="60"
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              Velocidade Aferida
            </label>
            <input
              type="text"
              value={formData.velocidadeAferida || ''}
              onChange={(e) => updateField('velocidadeAferida', e.target.value)}
              placeholder="75"
              className="w-full px-4 py-3 bg-canvas border-2 border-ink/10 rounded-xl text-ink font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-mono"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CalculationResults({ 
  result, 
  onGenerateRecurso 
}: { 
  result: CalculationResult | null; 
  onGenerateRecurso: () => void;
}) {
  if (!result) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Calculator size={48} className="mx-auto text-muted mb-4" />
        <p className="text-lg font-semibold text-ink mb-2">Preencha os dados da multa</p>
        <p className="text-muted">Complete o formulário para ver os cálculos e simulações</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Multa */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`p-4 md:p-6 rounded-2xl border ${getRiskColor(result.diasAtraso)}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{getRiskText(result.diasAtraso)}</h3>
            <p className="text-sm opacity-80">
              {result.diasAtraso > 0 
                ? `Multa vencida há ${result.diasAtraso} dias`
                : 'Multa dentro do prazo'
              }
            </p>
          </div>
          <AlertTriangle size={28} />
        </div>
      </motion.div>

      {/* Cards de Valores */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <ValueCard
          title="Valor Original"
          value={formatCurrency(result.valorOriginal)}
          subtitle="Valor total da multa"
          color="text-ink"
        />
        
        <ValueCard
          title="Com Desconto SNE"
          value={formatCurrency(result.valorComDescontoSNE)}
          subtitle={`Economia: ${formatCurrency(result.descontoSNE)}`}
          color="text-green-600"
          highlight={result.isElegivelSNE}
        />
        
        <ValueCard
          title="Se Recorrer e Ganhar"
          value={formatCurrency(0)}
          subtitle={`Probabilidade: ${formatPercentage(result.probabilidadeRecurso)}`}
          color="text-blue-600"
        />
        
        <ValueCard
          title="Com Juros (Atraso)"
          value={formatCurrency(result.valorComJuros)}
          subtitle={result.diasAtraso > 0 ? `+${formatCurrency(result.valorComJuros - result.valorOriginal)}` : 'Sem juros'}
          color={result.diasAtraso > 0 ? "text-red-600" : "text-green-600"}
        />
      </motion.div>

      {/* Elegibilidade SNE */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`p-4 md:p-6 rounded-2xl border ${
          result.isElegivelSNE 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
        }`}
      >
        <div className="flex items-start gap-3">
          {result.isElegivelSNE ? (
            <CheckCircle2 size={24} className="text-green-600 mt-0.5 shrink-0" />
          ) : (
            <X size={24} className="text-red-600 mt-0.5 shrink-0" />
          )}
          <div>
            <h4 className="text-lg font-bold">
              {result.isElegivelSNE ? 'Elegível para SNE' : 'Não elegível para SNE'}
            </h4>
            <p className="text-sm opacity-90">
              {result.isElegivelSNE 
                ? 'Você pode pagar com 40% de desconto'
                : `${result.pontosEvitados > 7 ? 'Muitos pontos' : 'Tipo de infração'} impede o desconto`
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Recomendação */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 md:p-6 bg-gradient-to-r from-brand-soft/30 to-brand-soft/10 border border-brand/20 rounded-2xl"
      >
        <h4 className="flex items-center gap-2 text-lg font-bold text-brand-emphasis mb-2">
          <Info size={20} />
          Recomendação
        </h4>
        <p className="text-sm md:text-base text-ink leading-relaxed">{result.recomendacao}</p>
      </motion.div>

      {/* Ações */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGenerateRecurso}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand to-brand-emphasis text-white rounded-xl hover:shadow-lg hover:shadow-brand/25 transition-all font-semibold"
        >
          <Gavel size={20} />
          Gerar Recurso com IA
        </motion.button>
        
        {result.isElegivelSNE && (
          <button className="flex-1 px-6 py-3 border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-all font-semibold">
            Como Aderir ao SNE
          </button>
        )}
      </motion.div>

      {/* Disclaimer */}
      <LegalDisclaimer
        type="warning"
        title="Aviso Legal"
        content={LEGAL_TEXTS.calculatorDisclaimer}
        className="mt-6"
      />
    </div>
  );
}

function ValueCard({ 
  title, 
  value, 
  subtitle, 
  color, 
  highlight = false 
}: { 
  title: string;
  value: string;
  subtitle: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.02 }}
      className={`p-4 rounded-2xl border transition-all ${
        highlight 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md shadow-green-500/10' 
          : 'bg-surface border-ink/8 hover:border-ink/15 hover:shadow-md'
      }`}
    >
      <h4 className="text-sm font-semibold text-muted mb-1">{title}</h4>
      <p className={`text-xl md:text-2xl font-bold ${color} mb-1`}>{value}</p>
      <p className="text-xs text-muted">{subtitle}</p>
    </motion.div>
  );
}
