const number = new Intl.NumberFormat("en-US");
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatNumber(value: number): string {
  return number.format(value);
}

export function formatCurrency(value: number): string {
  return currency.format(value);
}
