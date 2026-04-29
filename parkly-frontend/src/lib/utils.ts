import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string) {
  const locales: Record<string, string> = {
    USD: "en-US",
    EUR: "de-DE",
    COP: "es-CO",
  };
  
  const symbol: Record<string, string> = {
    USD: "$",
    EUR: "€",
    COP: "$",
  };

  return new Intl.NumberFormat(locales[currency] || "en-US", {
    style: "currency",
    currency: currency === "COP" ? "COP" : currency,
    minimumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(amount);
}
