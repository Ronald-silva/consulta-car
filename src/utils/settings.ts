import type { AppSettings } from '../types';

const SETTINGS_KEY = 'consulta_car_settings';

/** Configurações padrão do aplicativo */
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: true,
  lgpdConsent: false,
  autoBackup: false,
};

/** Obter configurações do localStorage */
export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Erro ao carregar configurações:', error);
  }
  return DEFAULT_SETTINGS;
}

/** Salvar configurações no localStorage */
export function saveSettings(settings: Partial<AppSettings>): void {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
}

/** Verificar se o usuário deu consentimento LGPD */
export function hasLgpdConsent(): boolean {
  const settings = getSettings();
  return settings.lgpdConsent === true;
}

/** Registrar consentimento LGPD */
export function setLgpdConsent(consent: boolean): void {
  saveSettings({
    lgpdConsent: consent,
    consentDate: consent ? new Date().toISOString() : undefined,
  });
}

/** Limpar todas as configurações (LGPD - direito ao esquecimento) */
export function clearAllSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Erro ao limpar configurações:', error);
  }
}

/** Exportar dados para backup */
export function exportAppData(): string {
  const data = {
    vehicles: localStorage.getItem('vehicles'),
    cnhs: localStorage.getItem('cnhs'),
    settings: localStorage.getItem(SETTINGS_KEY),
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };
  return JSON.stringify(data, null, 2);
}

/** Importar dados de backup */
export function importAppData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    // Validar estrutura básica
    if (!data.version || !data.exportDate) {
      throw new Error('Formato de backup inválido');
    }
    
    // Restaurar dados
    if (data.vehicles) {
      localStorage.setItem('vehicles', data.vehicles);
    }
    if (data.cnhs) {
      localStorage.setItem('cnhs', data.cnhs);
    }
    if (data.settings) {
      localStorage.setItem(SETTINGS_KEY, data.settings);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao importar backup:', error);
    return false;
  }
}