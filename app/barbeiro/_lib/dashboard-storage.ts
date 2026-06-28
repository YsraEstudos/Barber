import type { Appointment, AvailabilityConfig, HolidayBlock } from "@/lib/types";
import type { DashboardUser } from "./dashboard-types";

const appointmentsKey = "aureum_appointments";
const availabilityKey = "aureum_availability";
const holidayBlocksKey = "aureum_holiday_blocks";
const sessionKey = "barber_session";

function readJson<T>(key: string) {
  const value = localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readStoredAppointments() {
  return readJson<Appointment[]>(appointmentsKey);
}

export function writeStoredAppointments(appointments: Appointment[]) {
  writeJson(appointmentsKey, appointments);
}

export function readStoredAvailability() {
  return readJson<AvailabilityConfig[]>(availabilityKey);
}

export function writeStoredAvailability(availability: AvailabilityConfig[]) {
  writeJson(availabilityKey, availability);
}

export function readStoredHolidayBlocks() {
  return readJson<HolidayBlock[]>(holidayBlocksKey);
}

export function writeStoredHolidayBlocks(blocks: HolidayBlock[]) {
  writeJson(holidayBlocksKey, blocks);
}

export function readStoredSession() {
  return readJson<DashboardUser>(sessionKey);
}

export function writeStoredSession(user: DashboardUser) {
  writeJson(sessionKey, user);
}

export function clearStoredSession() {
  localStorage.removeItem(sessionKey);
}

export function hasStoredAppointments() {
  return Boolean(localStorage.getItem(appointmentsKey));
}

export function hasStoredAvailability() {
  return Boolean(localStorage.getItem(availabilityKey));
}

export function hasStoredHolidayBlocks() {
  return Boolean(localStorage.getItem(holidayBlocksKey));
}
