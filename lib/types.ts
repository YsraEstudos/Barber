export const ANY_BARBER_ID = "any";

export type Barber = {
  id: string;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
  active: boolean;
};

export type Service = {
  id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price_cents: number;
  active: boolean;
};

export type Slot = {
  date: string;
  start_time: string;
  end_time: string;
  label: string;
};

export type BookingPayload = {
  serviceId: string;
  barberId: string;
  date: string;
  startTime: string;
  clientName: string;
  whatsapp: string;
  notes?: string;
};

export type BookingSummary = {
  appointmentId: string;
  clientName: string;
  whatsapp: string;
  serviceName: string;
  barberName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
};

export type AppointmentStatus =
  | "confirmado"
  | "em_atendimento"
  | "finalizado"
  | "cancelado"
  | "nao_compareceu";


export type Appointment = {
  id: string;
  client_id: string;
  client_name: string;
  client_whatsapp: string;
  barber_id: string;
  barber_name: string;
  service_id: string;
  service_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string | null;
  price_cents: number;
};

export type BarberSession = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "barber";
};

export type AvailabilityConfig = {
  id?: string;
  barber_id: string;
  weekday: number; // 0-6
  start_time: string; // "HH:MM:SS"
  end_time: string;
  slot_interval_minutes: number;
  active: boolean;
};

export type HolidayBlock = {
  id?: string;
  barber_id: string;
  block_date: string; // "YYYY-MM-DD"
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
};

export type AvailabilityDay = {
  date: string;
  slots: Slot[];
};


