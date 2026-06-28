import type { Appointment, Barber } from "@/lib/types";
import { ANY_BARBER_ID } from "@/lib/types";
import type { DashboardUser } from "../_lib/dashboard-types";
import {
  hasStoredAppointments,
  hasStoredAvailability,
  hasStoredHolidayBlocks,
  writeStoredAppointments,
  writeStoredAvailability,
  writeStoredHolidayBlocks,
} from "../_lib/dashboard-storage";

export const DEMO_USERS: DashboardUser[] = [
  { email: "admin@barber.com", name: "Dono/Admin", role: "admin", id: "admin-id" },
  { email: "carlos@barber.com", name: "Carlos Silva", role: "barber", id: "c0000000-0000-0000-0000-000000000001" },
  { email: "miguel@barber.com", name: "Miguel Santos", role: "barber", id: "c0000000-0000-0000-0000-000000000002" },
  { email: "alexandre@barber.com", name: "Alexandre Costa", role: "barber", id: "c0000000-0000-0000-0000-000000000003" },
];

export function initializeDemoDashboardStorage(barbersList: Barber[]) {
  if (!hasStoredAppointments()) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const mockApps: Appointment[] = [
      { id: "app-1", client_id: "client-1", client_name: "João Silva", client_whatsapp: "11999998888", barber_id: "c0000000-0000-0000-0000-000000000001", barber_name: "Carlos Silva", service_id: "f0000000-0000-0000-0000-000000000001", service_name: "Corte de Cabelo", appointment_date: todayStr, start_time: "09:00:00", end_time: "09:45:00", status: "finalizado", price_cents: 6000, notes: "Gosta de degrade médio" },
      { id: "app-2", client_id: "client-2", client_name: "Marcos Souza", client_whatsapp: "11988887777", barber_id: "c0000000-0000-0000-0000-000000000001", barber_name: "Carlos Silva", service_id: "f0000000-0000-0000-0000-000000000002", service_name: "Combo Vip", appointment_date: todayStr, start_time: "11:00:00", end_time: "12:15:00", status: "em_atendimento", price_cents: 11000, notes: "Alergia a lâmina na bochecha, usar máquina de acabamento" },
      { id: "app-3", client_id: "client-3", client_name: "Felipe Neto", client_whatsapp: "21977776666", barber_id: "c0000000-0000-0000-0000-000000000001", barber_name: "Carlos Silva", service_id: "f0000000-0000-0000-0000-000000000003", service_name: "Barba Tradicional", appointment_date: todayStr, start_time: "14:30:00", end_time: "15:00:00", status: "confirmado", price_cents: 4500, notes: null },
      { id: "app-4", client_id: "client-4", client_name: "Daniel Oliveira", client_whatsapp: "11966665555", barber_id: "c0000000-0000-0000-0000-000000000002", barber_name: "Miguel Santos", service_id: "f0000000-0000-0000-0000-000000000001", service_name: "Corte de Cabelo", appointment_date: todayStr, start_time: "10:00:00", end_time: "10:45:00", status: "confirmado", price_cents: 6000, notes: "Quer risquinho na sobrancelha" },
    ];
    writeStoredAppointments(mockApps);
  }

  if (!hasStoredAvailability()) {
    writeStoredAvailability(barbersList.flatMap((barber) =>
      [1, 2, 3, 4, 5, 6].map((day) => ({
        barber_id: barber.id,
        weekday: day,
        start_time: "09:00:00",
        end_time: "18:00:00",
        slot_interval_minutes: 30,
        active: true,
      })),
    ));
  }

  if (!hasStoredHolidayBlocks()) {
    writeStoredHolidayBlocks([
      { id: "block-natal", barber_id: "c0000000-0000-0000-0000-000000000001", block_date: "2026-12-25", reason: "Natal" },
      { id: "block-anonovo", barber_id: ANY_BARBER_ID, block_date: "2026-01-01", reason: "Ano Novo" },
    ]);
  }
}
