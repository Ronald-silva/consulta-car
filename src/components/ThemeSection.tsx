import React, { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  applyThemeToDocument,
  getStoredThemePreference,
  resolveEffectiveTheme,
  setThemePreference,
  type ThemePreference,
} from '../utils/theme';

export function ThemeSection() {
  const [pref, setPref] = useState<ThemePreference>(() => getStoredThemePreference());

  useEffect(() => {
    if (pref !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeToDocument(resolveEffectiveTheme('system'));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const choose = (p: ThemePreference) => {
    setPref(p);
    setThemePreference(p);
  };

  const btn =
    'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition border-ink/8 bg-canvas hover:bg-brand-soft hover:border-brand/35';

  const active = 'border-brand/40 bg-brand-soft text-brand-emphasis ring-1 ring-brand/25';

  return (
    <div className="border-t border-ink/8 pt-8 mt-8">
      <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-4">Aparência</h4>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Tema claro, escuro ou seguir o sistema — útil para leitura à noite com menos cansaço.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => choose('light')} className={`${btn} ${pref === 'light' ? active : 'text-ink'}`}>
          <Sun size={18} aria-hidden />
          Claro
        </button>
        <button type="button" onClick={() => choose('dark')} className={`${btn} ${pref === 'dark' ? active : 'text-ink'}`}>
          <Moon size={18} aria-hidden />
          Escuro
        </button>
        <button
          type="button"
          onClick={() => choose('system')}
          className={`${btn} ${pref === 'system' ? active : 'text-ink'}`}
        >
          <Monitor size={18} aria-hidden />
          Sistema
        </button>
      </div>
    </div>
  );
}
