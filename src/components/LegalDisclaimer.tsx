import React, { useState } from 'react';
import { Info, AlertTriangle, Shield, X } from 'lucide-react';

interface LegalDisclaimerProps {
  type: 'info' | 'warning' | 'lgpd';
  title: string;
  content: string;
  className?: string;
  collapsible?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function LegalDisclaimer({
  type,
  title,
  content,
  className = '',
  collapsible = false,
  onAccept,
  onDecline,
}: LegalDisclaimerProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'lgpd':
        return <Shield size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'lgpd':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-xl ${getStyles()} ${className}`}>
      <div
        className={`flex items-center gap-3 p-4 ${
          collapsible ? 'cursor-pointer hover:bg-black/5' : ''
        }`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          {!collapsible && (
            <p className="text-xs mt-1 leading-relaxed opacity-90">{content}</p>
          )}
        </div>
        {collapsible && (
          <button
            type="button"
            className="p-1 hover:bg-black/10 rounded"
            aria-label={isExpanded ? 'Recolher' : 'Expandir'}
          >
            <X
              size={16}
              className={`transition-transform ${
                isExpanded ? 'rotate-45' : 'rotate-0'
              }`}
            />
          </button>
        )}
      </div>

      {collapsible && isExpanded && (
        <div className="px-4 pb-4">
          <p className="text-xs leading-relaxed opacity-90 mb-4">{content}</p>
          
          {(onAccept || onDecline) && (
            <div className="flex gap-2">
              {onDecline && (
                <button
                  onClick={onDecline}
                  className="px-3 py-1.5 text-xs font-semibold border border-current rounded-lg hover:bg-black/5 transition"
                >
                  Recusar
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-3 py-1.5 text-xs font-semibold bg-current text-white rounded-lg hover:opacity-90 transition"
                >
                  Aceitar
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Componente específico para consentimento LGPD */
export function LgpdConsent({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-soft text-blue-600">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-ink">Proteção de Dados</h3>
              <p className="text-sm text-muted">Consentimento LGPD</p>
            </div>
          </div>

          <p className="text-sm text-ink leading-relaxed mb-6">
            Para usar este aplicativo, precisamos do seu consentimento para processar seus dados localmente. 
            Seus dados ficam apenas no seu dispositivo e não são enviados para servidores externos.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-2 text-sm font-semibold text-muted border border-ink/20 rounded-lg hover:bg-canvas transition"
            >
              Recusar
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-emphasis transition"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}