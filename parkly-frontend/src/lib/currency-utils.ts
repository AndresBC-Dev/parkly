import { Currency } from "./parking-types";

// Mock exchange rates (Base: USD)
const BASE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  COP: 3950,
};

/**
 * Converts an amount from one currency to another.
 * @param amount The value to convert
 * @param from The source currency code
 * @param to The target currency code
 */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  
  // Convert to USD first
  const amountInUSD = amount / (BASE_RATES[from] || 1);
  
  // Convert from USD to target
  const result = amountInUSD * (BASE_RATES[to] || 1);
  
  return result;
}

/**
 * Normalizes an array of amounts with different currencies to a single target currency.
 */
export function sumConverted(items: { amount: number; currency: string }[], target: Currency): number {
  return items.reduce((sum, item) => {
    return sum + convertCurrency(item.amount, (item.currency || "EUR") as Currency, target);
  }, 0);
}
