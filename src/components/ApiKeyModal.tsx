import React, { useState } from 'react';
import { X, Key, ExternalLink, AlertTriangle } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/settings';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(() => {
    const settings = getSettings();
    return settings.geminiApiKey || '';
  });
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    saveSettings({ geminiApiKey: apiKey });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink/8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-emphasis">
              <Key size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Configurar API Gemini</h2>
              <p className="text-sm text-muted">Para usar a análise com IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instruções */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Como obter sua API Key:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Acesse o Google AI Studio</li>
              <li>2. Faça login com sua conta Google</li>
              <li>3. Clique em "Get API Key"</li>
              <li>4. Copie a chave gerada</li>
            </ol>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={14} />
              Abrir Google AI Studio
            </a>
          </div>

          {/* Input da API Key */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Chave da API Gemini
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 pr-20 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-muted hover:text-ink"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {/* Aviso de Segurança */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Segurança</h4>
                <p className="text-sm text-amber-700">
                  Sua chave de API é armazenada localmente no navegador e não é enviada para nossos servidores. 
                  Mantenha-a segura e não a compartilhe.
                </p>
              </div>
            </div>
          </div>

          {/* Custos */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-1">Custos</h4>
            <p className="text-sm text-green-700">
              O Gemini Pro tem uma cota gratuita generosa. Cada análise de multa consome aproximadamente 
              1000-2000 tokens (~R$ 0,01-0,02 por análise).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-ink/8 bg-canvas/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-muted border border-ink/20 rounded-lg hover:bg-canvas hover:text-ink transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="px-6 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-emphasis disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}