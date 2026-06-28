import type { Slot } from "@/lib/types";

type AvailabilityRow = {
  weekday: number;
  start_time: string;
  end_time: string;
  slot_interval_minutes: number;
};

type AppointmentRow = {
  start_time: string;
  end_time: string;
};

export function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const nextHours = Math.floor(total / 60);
  const nextMinutes = total % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}:00`;
}

function toMinutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
) {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(endA) > toMinutes(startB);
}

export function getNextDates(days = 14) {
  const dates: string[] = [];
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  for (let index = 0; index < days; index += 1) {
    const date = new Date(current);
    date.setDate(current.getDate() + index);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

export function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function buildSlotsForDate(
  date: string,
  durationMinutes: number,
  availability: AvailabilityRow[],
  appointments: AppointmentRow[],
) {
  const weekday = parseLocalDate(date).getDay();
  const windows = availability.filter((item) => item.weekday === weekday);
  const slots: Slot[] = [];
  const now = new Date();

  windows.forEach((window) => {
    let cursor = window.start_time;
    const interval = window.slot_interval_minutes || 30;

    while (toMinutes(addMinutes(cursor, durationMinutes)) <= toMinutes(window.end_time)) {
      const endTime = addMinutes(cursor, durationMinutes);
      
      const [hours, mins] = cursor.split(":").map(Number);
      const slotDate = parseLocalDate(date);
      slotDate.setHours(hours, mins, 0, 0);
      const startsInPast = slotDate <= now;

      const busy = appointments.some((appointment) =>
        overlaps(cursor, endTime, appointment.start_time, appointment.end_time),
      );

      if (!startsInPast && !busy) {
        slots.push({
          date,
          start_time: cursor,
          end_time: endTime,
          label: formatTime(cursor),
        });
      }

      cursor = addMinutes(cursor, interval);
    }
  });

  return slots;
}
