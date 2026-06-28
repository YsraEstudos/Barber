import { parseLocalDate } from "@/lib/scheduling";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function priceFromCents(value: number) {
  return currencyFormatter.format(value / 100);
}

export function formatFullDate(date: string) {
  return fullDateFormatter.format(parseLocalDate(date));
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function getShortWeekday(dateStr: string) {
  const date = parseLocalDate(dateStr);
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return weekdays[date.getDay()];
}

export function getDayNumber(dateStr: string) {
  return dateStr.split("-")[2];
}
