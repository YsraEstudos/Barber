import type { Appointment, AvailabilityConfig } from "@/lib/types";

export type ActiveTab = "agenda" | "servicos" | "horarios" | "faturamento";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type WeekDay = {
  dateStr: string;
  dayNum: number;
  weekDayLabel: string;
};

export type ToastMessage = { title: string; body: string; time: string };

export type BillingStats = {
  faturamentoTotal: number;
  faturamentoHoje: number;
  atendimentosConcluidos: number;
  agendamentosAtivos: number;
  topServices: Array<{ name: string; count: number }>;
};

export type AvailabilityUpdate = Partial<Pick<AvailabilityConfig, "start_time" | "end_time" | "active">>;

export type AppointmentStatusChange = (status: Appointment["status"]) => void;
