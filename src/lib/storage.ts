import { type AppData, CURRENT_SCHEMA_VERSION, createEmptyAppData } from '../types';

const STORAGE_KEY = 'cake-cost-calculator:data';
const PROBE_KEY = 'cake-cost-calculator:__probe__';

export function isStorageAvailable(): boolean {
  try {
    window.localStorage.setItem(PROBE_KEY, '1');
    window.localStorage.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function loadAppData(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyAppData();
    const parsed = JSON.parse(raw);
    if (parsed?.schemaVersion === CURRENT_SCHEMA_VERSION) {
      return parsed as AppData;
    }
    return createEmptyAppData();
  } catch {
    return createEmptyAppData();
  }
}

export function saveAppData(data: AppData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
