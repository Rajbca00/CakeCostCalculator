import type { AppData } from '../types';
import { AppDataImportSchema } from './schemas';

export interface ImportValidationResult {
  success: boolean;
  data?: AppData;
  error?: string;
}

export function parseImportedAppData(json: string): ImportValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { success: false, error: 'The file is not valid JSON.' };
  }

  const result = AppDataImportSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'The file does not match the expected backup format.' };
  }

  return { success: true, data: result.data };
}

export function exportAppData(data: AppData): void {
  const payload = {
    ...data,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cake-cost-calculator-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
