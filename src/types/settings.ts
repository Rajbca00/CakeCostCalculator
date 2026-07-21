export interface BusinessSettings {
  /** ₹ per hour of active labour time. */
  laborHourlyRate: number;
  /** ₹ per kWh (electricity tariff). */
  electricityRatePerUnit: number;
  /** Default oven power in watts, used unless a recipe overrides it. */
  ovenPowerWatts: number;
  /** ₹ per hour of LPG/gas usage. */
  lpgCostPerHour: number;
  /** Default ingredient wastage %, e.g. 3 for 3%. Recipes may override this. */
  wastagePercent: number;
  /** Default markup % suggested for new recipes. */
  defaultMarkupPercent: number;
  currencyCode: string;
  currencySymbol: string;
  /** Tax % applied on top of the selling price where relevant. */
  taxPercent: number;
  updatedAt: string;
}

/**
 * Conservative defaults: labour/electricity/LPG rates start at 0 so a recipe's
 * automatic labour/electricity cost is 0 until the bakery owner fills in real
 * rates on the Settings page -- existing recipes' costs never shift silently.
 * Wastage defaults to 3% per spec, since it's shown as its own visible line
 * rather than folded invisibly into the existing cost total.
 */
export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  laborHourlyRate: 0,
  electricityRatePerUnit: 0,
  ovenPowerWatts: 1500,
  lpgCostPerHour: 0,
  wastagePercent: 3,
  defaultMarkupPercent: 0,
  currencyCode: 'INR',
  currencySymbol: '₹',
  taxPercent: 0,
  updatedAt: '',
};
