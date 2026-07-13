const CURRENCY_SYMBOL = '₹';

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) amount = 0;
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatUnitCost(amount: number): string {
  if (!Number.isFinite(amount)) amount = 0;
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

export function formatQuantity(quantity: number): string {
  if (!Number.isFinite(quantity)) return '0';
  return quantity.toLocaleString('en-IN', { maximumFractionDigits: 3 });
}
