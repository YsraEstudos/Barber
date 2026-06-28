export type Step =
  | "service"
  | "barber"
  | "date"
  | "time"
  | "name"
  | "whatsapp"
  | "notes"
  | "review";

export const steps: Step[] = [
  "service",
  "barber",
  "date",
  "time",
  "name",
  "whatsapp",
  "notes",
  "review",
];

export const stepCopy: Record<Step, { title: string; subtitle: string; kicker: string }> = {
  service: {
    kicker: "Passo 1 de 8",
    title: "Escolha o Serviço",
    subtitle: "Selecione o serviço ideal para o seu visual hoje.",
  },
  barber: {
    kicker: "Passo 2 de 8",
    title: "Escolha o Barbeiro",
    subtitle: "Escolha seu profissional de preferência ou a primeira vaga livre.",
  },
  date: {
    kicker: "Passo 3 de 8",
    title: "Escolha o Dia",
    subtitle: "Selecione uma data para a sua sessão de cuidados premium.",
  },
  time: {
    kicker: "Passo 4 de 8",
    title: "Escolha o Horário",
    subtitle: "Selecione um horário disponível para o dia escolhido.",
  },
  name: {
    kicker: "Passo 5 de 8",
    title: "Seu Nome",
    subtitle: "Como devemos chamar você na barbearia?",
  },
  whatsapp: {
    kicker: "Passo 6 de 8",
    title: "Seu WhatsApp",
    subtitle: "Utilizaremos para enviar confirmações e lembretes.",
  },
  notes: {
    kicker: "Passo 7 de 8",
    title: "Algum detalhe extra?",
    subtitle: "Diga se você tem alguma preferência especial ou alergias.",
  },
  review: {
    kicker: "Passo 8 de 8",
    title: "Confirme seu horário",
    subtitle: "Revise todos os detalhes antes de finalizar a reserva.",
  },
};
