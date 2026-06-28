import type { AvailabilityDay } from "@/lib/types";

export type CalendarCell = {
  dateStr: string | null;
  dayNumber: number;
  status: "disabled" | "available" | "booked" | "selected";
};

export function buildCalendarCells(currentYear: number, currentMonth: number, availability: AvailabilityDay[], selectedDate: string) {
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ dateStr: null, dayNumber: 0, status: "disabled" });
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayData = availability.find((item) => item.date === dateStr);
    let status: CalendarCell["status"] = "disabled";

    if (dateStr === selectedDate) {
      status = "selected";
    } else if (dayData) {
      status = dayData.slots.length > 0 ? "available" : "booked";
    }

    cells.push({ dateStr, dayNumber: day, status });
  }

  return cells;
}
