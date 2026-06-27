export type Barber = {
  id: string;
  name: string;
  bio?: string | null;
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
