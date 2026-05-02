const STORAGE_KEY = 'consulta-car-theme';

export type ThemePreference = 'light' | 'dark' | 'system';

export function getStoredThemePreference(): ThemePreference {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'dark' || v === 'light' || v === 'system') return v;
  return 'system';
}

export function resolveEffectiveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

export function applyThemeToDocument(effective: 'light' | 'dark'): void {
  document.documentElement.classList.toggle('dark', effective === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', effective === 'dark' ? '#0f172a' : '#0d9488');
}

export function initThemeFromStorage(): void {
  applyThemeToDocument(resolveEffectiveTheme(getStoredThemePreference()));
}

export function setThemePreference(pref: ThemePreference): void {
  localStorage.setItem(STORAGE_KEY, pref);
  applyThemeToDocument(resolveEffectiveTheme(pref));
}
