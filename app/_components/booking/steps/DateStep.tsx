import type { CalendarCell } from "@/app/_lib/booking-calendar";

type DateStepProps = {
  prevMonth: () => void;
  nextMonth: () => void;
  monthLabel: string;
  calendarCells: CalendarCell[];
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: null) => void;
  goNext: (step: "time") => void;
};

export function DateStep({
  prevMonth,
  nextMonth,
  monthLabel,
  calendarCells,
  setSelectedDate,
  setSelectedSlot,
  goNext,
}: DateStepProps) {
  return (
    <div className="calendar-container">
      <div className="month-picker">
        <button
          type="button"
          className="month-picker-btn"
          onClick={prevMonth}
          aria-label="Mês anterior"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="month-title">{monthLabel}</span>
        <button
          type="button"
          className="month-picker-btn"
          onClick={nextMonth}
          aria-label="Próximo mês"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekday">Dom</div>
        <div className="calendar-weekday">Seg</div>
        <div className="calendar-weekday">Ter</div>
        <div className="calendar-weekday">Qua</div>
        <div className="calendar-weekday">Qui</div>
        <div className="calendar-weekday">Sex</div>
        <div className="calendar-weekday">Sáb</div>

        {calendarCells.map((cell, idx) => {
          if (cell.dayNumber === 0) {
            return <div key={`empty-${idx}`} />;
          }

          const isSelected = cell.status === "selected";
          const isAvailable = cell.status === "available";
          const isBooked = cell.status === "booked";

          return (
            <button
              type="button"
              key={`day-${cell.dayNumber}`}
              className={`calendar-day-btn ${isSelected ? "selected" : ""} ${isBooked ? "fully-booked" : ""}`}
              disabled={cell.status === "disabled" || isBooked}
              onClick={() => {
                if (cell.dateStr) {
                  setSelectedDate(cell.dateStr);
                  setSelectedSlot(null);
                  goNext("time");
                }
              }}
            >
              <span>{cell.dayNumber}</span>
              {isAvailable && <span className="day-dot" />}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="dot available" />
          <span>Disponível</span>
        </div>
        <div className="legend-item">
          <span className="line-booked" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}
