export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? 'N/A' : numValue.toFixed(2);
}