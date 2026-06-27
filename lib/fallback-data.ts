import type { Barber, Service } from "@/lib/types";

export const fallbackServices: Service[] = [
  {
    id: "corte",
    name: "Corte",
    description: "Corte masculino com acabamento",
    duration_minutes: 45,
    price_cents: 4500,
    active: true,
  },
  {
    id: "barba",
    name: "Barba",
    description: "Modelagem, toalha quente e finalizacao",
    duration_minutes: 30,
    price_cents: 3500,
    active: true,
  },
  {
    id: "corte-barba",
    name: "Corte + Barba",
    description: "Combo completo para cabelo e barba",
    duration_minutes: 75,
    price_cents: 7500,
    active: true,
  },
  {
    id: "outros",
    name: "Outros servicos",
    description: "Servicos extras configuraveis no Supabase",
    duration_minutes: 45,
    price_cents: 5000,
    active: true,
  },
];

export const fallbackBarbers: Barber[] = [
  {
    id: "principal",
    name: "Primeiro barbeiro disponivel",
    bio: "Selecao automatica para barbearias com um unico profissional.",
    active: true,
  },
];
