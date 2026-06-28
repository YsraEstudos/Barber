import type { Appointment, Barber } from "@/lib/types";
import type { DashboardUser, WeekDay } from "../_lib/dashboard-types";
import { formatCurrencyFromCents, formatPanelLongDate } from "../_lib/dashboard-formatters";

type AgendaTabProps = {
  user: DashboardUser;
  barbers: Barber[];
  appointments: Appointment[];
  filteredAppointments: Appointment[];
  selectedBarberId: string;
  selectedDate: string;
  weekDays: WeekDay[];
  onSelectBarber: (barberId: string) => void;
  onSelectDate: (date: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
};

export function AgendaTab({
  user,
  barbers,
  appointments,
  filteredAppointments,
  selectedBarberId,
  selectedDate,
  weekDays,
  onSelectBarber,
  onSelectDate,
  onSelectAppointment,
}: AgendaTabProps) {
  return (
    <div className="tabContent animate-fade-up">
      <div className="agendaControls">
        <div className="barberSelector">
          <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>person</span>
          <label style={{ fontSize: "14px", fontWeight: "600" }}>Agenda de:</label>
          {user.role === "admin" ? (
            <select value={selectedBarberId} onChange={(event) => onSelectBarber(event.target.value)}>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontWeight: "700", color: "var(--primary)" }}>{user.name}</span>
          )}
        </div>

        <div style={{ fontStyle: "italic", fontSize: "14px", color: "var(--on-surface-variant)" }}>
          {formatPanelLongDate(selectedDate)}
        </div>
      </div>

      <div className="weekCalendar">
        {weekDays.map((weekDay) => {
          const isSelected = weekDay.dateStr === selectedDate;
          const hasAppointments = appointments.some(
            (appointment) =>
              appointment.appointment_date === weekDay.dateStr &&
              appointment.barber_id === selectedBarberId &&
              appointment.status !== "cancelado",
          );

          return (
            <div
              key={weekDay.dateStr}
              className={`weekDayCard ${isSelected ? "active" : ""}`}
              onClick={() => onSelectDate(weekDay.dateStr)}
            >
              <span className="weekDayName">{weekDay.weekDayLabel}</span>
              <span className="weekDayNum">{weekDay.dayNum}</span>
              <div className={`weekDayOccupancy ${hasAppointments ? "busy" : ""}`}></div>
            </div>
          );
        })}
      </div>

      <div className="timelineWrapper">
        {filteredAppointments.length === 0 ? (
          <div className="timelineEmpty">
            <span className="material-symbols-outlined">hotel_class</span>
            <p>Nenhum agendamento ativo para este dia.</p>
            <small style={{ color: "var(--on-surface-variant)" }}>Agendamentos marcados aparecerão aqui.</small>
          </div>
        ) : (
          <div className="timelineList">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="timelineItem">
                <div className="timelineTime">
                  {appointment.start_time.slice(0, 5)}
                  <span className="endTime">{appointment.end_time.slice(0, 5)}</span>
                </div>
                <div className={`timelineCard ${appointment.status}`} onClick={() => onSelectAppointment(appointment)}>
                  <div className="cardLeft">
                    <span className="clientName">{appointment.client_name}</span>
                    <div className="serviceInfo">
                      <span>{appointment.service_name}</span>
                      <span className="priceBadge">
                        {formatCurrencyFromCents(appointment.price_cents)}
                      </span>
                    </div>
                  </div>
                  <span className="statusIndicator">{appointment.status.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
