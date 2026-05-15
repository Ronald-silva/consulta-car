import React, { useState } from 'react';
import { Search, Car, AlertCircle, Zap, CheckCircle2, Clock, Shield, FileText, TrendingUp, Users } from 'lucide-react';
import { useLaudoStore } from '../../stores/laudoStore';
import { consultarVeiculo, isValidPlaca, formatPlaca } from '../../services/veiculoService';

interface ConsultaVeicularProps {
  onSuccess: () => void;
}

export function ConsultaVeicular({ onSuccess }: ConsultaVeicularProps) {
  const { setLoading, setError, setConsulta, isLoading, error } = useLaudoStore();
  
  const [placa, setPlaca] = useState('');
  const [renavam, setRenavam] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);

  const handleConsultar = async () => {
    if (!placa.trim()) {
      setError('Placa é obrigatória');
      return;
    }

    if (!isValidPlaca(placa)) {
      setError('Formato de placa inválido');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const consulta = await consultarVeiculo(
        placa,
        renavam || undefined,
        (step, prog) => {
          setCurrentStep(step);
          setProgress(prog);
        }
      );

      setConsulta(consulta);
      onSuccess();
    } catch (err) {
      console.error('Erro na consulta:', err);
      setError('Falha na consulta. Tente novamente.');
    } finally {
      setLoading(false);
      setCurrentStep('');
      setProgress(0);
    }
  };

  const handlePlacaChange = (value: string) => {
    const formatted = value.replace(/[^A-Z0-9]/g, '').toUpperCase().slice(0, 7);
    setPlaca(formatted);
    setError(undefined);
  };

  const handleRenavamChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').slice(0, 11);
    setRenavam(formatted);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <ConsultaProgress step={currentStep} progress={progress} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-soft text-brand-emphasis mx-auto mb-6">
          <Search size={32} strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-bold text-ink mb-3">Consulta Veicular Completa</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Obtenha um relatório completo do veículo incluindo multas, débitos, restrições, 
          recalls e histórico de proprietários.
        </p>
      </div>

      {/* Formulário */}
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            Placa do Veículo *
          </label>
          <input
            type="text"
            value={formatPlaca(placa)}
            onChange={(e) => handlePlacaChange(e.target.value)}
            placeholder="ABC-1234"
            className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition text-center font-mono text-lg tracking-wider"
            maxLength={8}
          />
          <p className="text-xs text-muted mt-1">
            Formato: ABC-1234 (antiga) ou ABC-1D23 (Mercosul)
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            RENAVAM (opcional)
          </label>
          <input
            type="text"
            value={renavam}
            onChange={(e) => handleRenavamChange(e.target.value)}
            placeholder="12345678901"
            className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition text-center font-mono"
            maxLength={11}
          />
          <p className="text-xs text-muted mt-1">
            Opcional: melhora a precisão da consulta
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span className="font-semibold">Erro:</span>
            </div>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleConsultar}
          disabled={!placa.trim() || isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand text-white rounded-xl font-semibold text-lg hover:bg-brand-emphasis disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          <Search size={24} />
          Consultar Veículo
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <FeatureCard
          icon={<Car size={24} className="text-blue-600" />}
          title="Dados Completos"
          description="Marca, modelo, ano, cor e especificações técnicas"
        />
        
        <FeatureCard
          icon={<FileText size={24} className="text-green-600" />}
          title="Multas e Débitos"
          description="Situação financeira completa do veículo"
        />
        
        <FeatureCard
          icon={<Shield size={24} className="text-red-600" />}
          title="Restrições"
          description="Alienação, roubo, judicial e outras restrições"
        />
        
        <FeatureCard
          icon={<TrendingUp size={24} className="text-purple-600" />}
          title="Avaliação FIPE"
          description="Valor de mercado e sugestão de preço"
        />
      </div>


    </div>
  );
}

function ConsultaProgress({ step, progress }: { step: string; progress: number }) {
  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Animação de consulta */}
      <div className="text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-white mx-auto mb-6 animate-pulse">
          <Zap size={40} strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-ink mb-2">Consultando Veículo</h3>
        <p className="text-muted">Aguarde enquanto coletamos todas as informações...</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-ink">{step}</span>
          <span className="text-muted">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-brand h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-2 gap-4">
        <StepIndicator
          icon={<Car size={16} />}
          label="Dados do Veículo"
          completed={progress > 12.5}
          active={progress <= 12.5}
        />
        <StepIndicator
          icon={<FileText size={16} />}
          label="Multas"
          completed={progress > 37.5}
          active={progress > 12.5 && progress <= 37.5}
        />
        <StepIndicator
          icon={<Clock size={16} />}
          label="Débitos"
          completed={progress > 50}
          active={progress > 37.5 && progress <= 50}
        />
        <StepIndicator
          icon={<Shield size={16} />}
          label="Restrições"
          completed={progress > 62.5}
          active={progress > 50 && progress <= 62.5}
        />
      </div>
    </div>
  );
}

function StepIndicator({ 
  icon, 
  label, 
  completed, 
  active 
}: { 
  icon: React.ReactNode; 
  label: string; 
  completed: boolean; 
  active: boolean; 
}) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg transition ${
      completed 
        ? 'bg-green-50 text-green-700' 
        : active 
        ? 'bg-brand-soft text-brand-emphasis' 
        : 'bg-gray-50 text-gray-500'
    }`}>
      <div className={`flex h-6 w-6 items-center justify-center rounded ${
        completed 
          ? 'bg-green-500 text-white' 
          : active 
          ? 'bg-brand text-white' 
          : 'bg-gray-300 text-gray-600'
      }`}>
        {completed ? <CheckCircle2 size={14} /> : icon}
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="p-4 bg-surface border border-ink/8 rounded-xl text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <h4 className="font-semibold text-ink mb-2">{title}</h4>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}