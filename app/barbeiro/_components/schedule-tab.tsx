import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { AvailabilityConfig, HolidayBlock } from "@/lib/types";
import { ANY_BARBER_ID } from "@/lib/types";
import type { AvailabilityUpdate, DashboardUser } from "../_lib/dashboard-types";

type ScheduleTabProps = {
  user: DashboardUser;
  selectedBarberId: string;
  availabilityList: AvailabilityConfig[];
  holidayBlocks: HolidayBlock[];
  newBlockDate: string;
  newBlockReason: string;
  onUpdateAvailability: (
    weekday: number,
    updates: AvailabilityUpdate,
  ) => void;
  onAddHolidayBlock: (event: FormEvent) => void;
  onRemoveHolidayBlock: (id: string | undefined) => void;
  onBlockDateChange: Dispatch<SetStateAction<string>>;
  onBlockReasonChange: Dispatch<SetStateAction<string>>;
};

const weekdayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function ScheduleTab({
  user,
  selectedBarberId,
  availabilityList,
  holidayBlocks,
  newBlockDate,
  newBlockReason,
  onUpdateAvailability,
  onAddHolidayBlock,
  onRemoveHolidayBlock,
  onBlockDateChange,
  onBlockReasonChange,
}: ScheduleTabProps) {
  return (
    <div className="tabContent animate-fade-up">
      <div className="configSection">
        <h3>
          <span className="material-symbols-outlined">calendar_clock</span>
          Grade de Horários Padrão
        </h3>
        <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "20px" }}>
          Configure os horários de entrada e saída.
        </p>

        <div className="weekdayGrid">
          {weekdayNames.map((name, index) => {
            const config = availabilityList.find((item) => item.weekday === index && item.barber_id === selectedBarberId) || {
              start_time: "09:00:00",
              end_time: "18:00:00",
              active: index !== 0,
            };

            return (
              <div key={name} className="weekdayRow">
                <span className="weekdayNameLabel">{name}</span>

                <div className="timeInputPair">
                  <input
                    type="text"
                    disabled={user.role !== "admin"}
                    value={config.start_time.slice(0, 5)}
                    onChange={(event) => onUpdateAvailability(index, { start_time: `${event.target.value}:00` })}
                  />
                  <span style={{ fontSize: "12px", opacity: 0.5 }}>até</span>
                  <input
                    type="text"
                    disabled={user.role !== "admin"}
                    value={config.end_time.slice(0, 5)}
                    onChange={(event) => onUpdateAvailability(index, { end_time: `${event.target.value}:00` })}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label className="toggleSwitch">
                    <input
                      type="checkbox"
                      disabled={user.role !== "admin"}
                      checked={config.active}
                      onChange={() => onUpdateAvailability(index, { active: !config.active })}
                    />
                    <span className="toggleSlider"></span>
                  </label>
                  <span style={{ fontSize: "12px", fontWeight: "600" }}>{config.active ? "Aberto" : "Fechado"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="configSection">
        <h3>
          <span className="material-symbols-outlined">block</span>
          Bloqueios Especiais (Feriados ou Folgas)
        </h3>

        {user.role === "admin" && (
          <form onSubmit={onAddHolidayBlock} style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div className="inputGroup" style={{ flex: "1 1 180px", marginBottom: 0 }}>
              <label>Data</label>
              <input type="date" required value={newBlockDate} onChange={(event) => onBlockDateChange(event.target.value)} />
            </div>
            <div className="inputGroup" style={{ flex: "2 1 250px", marginBottom: 0 }}>
              <label>Motivo</label>
              <input
                type="text"
                placeholder="Ex: Feriado da Independência"
                value={newBlockReason}
                onChange={(event) => onBlockReasonChange(event.target.value)}
              />
            </div>
            <button type="submit" className="loginBtn" style={{ width: "auto", padding: "10px 24px", alignSelf: "flex-end", marginTop: 0 }}>
              Bloquear Data
            </button>
          </form>
        )}

        <div className="blockedDatesGrid">
          {holidayBlocks
            .filter((block) => block.barber_id === ANY_BARBER_ID || block.barber_id === selectedBarberId)
            .map((block, index) => (
              <div key={block.id || index} className="blockedDateCard">
                <div className="blockedDateInfo">
                  <p className="date">
                    {new Date(`${block.block_date}T12:00:00`).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="reason">{block.reason}</p>
                </div>
                {user.role === "admin" && (
                  <button className="removeBlockBtn" onClick={() => onRemoveHolidayBlock(block.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
