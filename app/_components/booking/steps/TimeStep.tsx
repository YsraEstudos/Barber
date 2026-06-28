import type { Slot } from "@/lib/types";
import { getShortWeekday, getDayNumber } from "@/app/_lib/booking-formatters";

type TimeStepProps = {
  availableDaysWithSlots: { date: string }[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: Slot | null) => void;
  loadingSlots: boolean;
  selectedDay?: { slots: Slot[] } | null;
  groupedSlots: { morning: Slot[]; afternoon: Slot[]; evening: Slot[] };
  selectedSlot: Slot | null;
  goNext: (step: "name") => void;
};

export function TimeStep({
  availableDaysWithSlots,
  selectedDate,
  setSelectedDate,
  setSelectedSlot,
  loadingSlots,
  selectedDay,
  groupedSlots,
  selectedSlot,
  goNext,
}: TimeStepProps) {
  const renderSlotsGroup = (
    title: string,
    icon: string,
    slots: Slot[],
  ) => {
    if (slots.length === 0) return null;

    return (
      <div className="time-slots-group">
        <h3 className="time-slots-group-header">
          <span className="material-symbols-outlined">{icon}</span>
          {title}
        </h3>
        <div className="time-slots-grid">
          {slots.map((slot) => {
            const isSelected =
              selectedSlot?.date === slot.date &&
              selectedSlot?.start_time === slot.start_time;
            return (
              <button
                type="button"
                key={slot.start_time}
                className={`time-slot-btn ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  setSelectedSlot(slot);
                  goNext("name");
                }}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="date-context-scroll">
        {availableDaysWithSlots.map((day) => {
          const isActive = day.date === selectedDate;
          return (
            <button
              type="button"
              key={day.date}
              className={`date-context-card ${isActive ? "active" : ""}`}
              onClick={() => {
                setSelectedDate(day.date);
                setSelectedSlot(null);
              }}
            >
              <span className="weekday">{getShortWeekday(day.date)}</span>
              <span className="day">{getDayNumber(day.date)}</span>
            </button>
          );
        })}
      </div>

      {loadingSlots ? (
        <p className="muted text-center py-8">Carregando horários...</p>
      ) : selectedDay?.slots.length ? (
        <div className="space-y-6">
          {renderSlotsGroup("Manhã", "light_mode", groupedSlots.morning)}
          {renderSlotsGroup("Tarde", "wb_sunny", groupedSlots.afternoon)}
          {renderSlotsGroup("Noite", "dark_mode", groupedSlots.evening)}
        </div>
      ) : (
        <p className="muted text-center py-8">Nenhum horário disponível para este dia.</p>
      )}
    </div>
  );
}
