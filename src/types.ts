export interface Vehicle {
  id: string;
  nickname: string;
  plate: string;
  renavam: string;
  chassis: string;
  brandModel: string;
  year: string;
  /** Ordem manual (arrastar) — menor aparece antes dentro do mesmo grupo */
  sortOrder?: number;
  /** Lista primeiro entre os não fixados */
  pinned?: boolean;
  /** Lembrete opcional — data ISO YYYY-MM-DD (ex.: vencimento licenciamento) */
  reminderDue?: string;
  reminderLabel?: string;
  /** Observações livres (ex.: onde guardou documento) */
  notes?: string;
}

export interface CNH {
  id: string;
  name: string;
  number: string;
  /** Apenas dígitos */
  cpf: string;
  sortOrder?: number;
  pinned?: boolean;
  notes?: string;
}

export interface ServiceLinks {
  ipva: string;
  licenciamento: string;
  multas: string;
  cnhPoints: string;
  cnhClearance: string;
  cnhRenewal: string;
}
