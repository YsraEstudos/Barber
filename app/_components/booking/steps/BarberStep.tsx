import type { Barber } from "@/lib/types";
import { ANY_BARBER_ID } from "@/lib/types";

type BarberStepProps = {
  barbers: Barber[];
  barberId: string;
  setBarberId: (id: string) => void;
  goNext: (step: "date") => void;
};

export function BarberStep({
  barbers,
  barberId,
  setBarberId,
  goNext,
}: BarberStepProps) {
  return (
    <div className="barber-list">
      {barbers.map((barber) => {
        const isSelected = barber.id === barberId;
        return (
          <button
            type="button"
            key={barber.id}
            className={`barber-card ${isSelected ? "selected" : ""}`}
            onClick={() => {
              setBarberId(barber.id);
              goNext("date");
            }}
          >
            <div className="barber-card-img">
              {barber.avatar_url ? (
                <div
                  className="avatar-image"
                  role="img"
                  aria-label={barber.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url(${barber.avatar_url})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                />
              ) : (
                <div className="w-full h-full bg-surface-container-highest flex items-center justify-center font-bold text-primary">
                  {barber.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="barber-card-info">
              <h3>{barber.name}</h3>
              <p>{barber.bio || "Profissional especialista"}</p>
              <div className="barber-card-meta">
                <span className="status">Disponível hoje</span>
              </div>
            </div>
            <div className="barber-card-indicator">
              <span className="material-symbols-outlined">check</span>
            </div>
          </button>
        );
      })}

      {/* ANY BARBER OPTION */}
      {barbers.length > 1 && (
        <button
          type="button"
          className={`barber-card any-barber ${barberId === ANY_BARBER_ID ? "selected" : ""}`}
          onClick={() => {
            setBarberId(ANY_BARBER_ID);
            goNext("date");
          }}
        >
          <div className="any-barber-content">
            <div className="any-barber-icon">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
            <h3>Qualquer Barbeiro</h3>
            <p>Mostrar o primeiro horário disponível</p>
          </div>
          {/* Replaced inline styles with a className for premium cleaner markup */}
          <div className={`barber-card-indicator-any ${barberId === ANY_BARBER_ID ? "visible" : ""}`}>
            <span className="material-symbols-outlined">check</span>
          </div>
        </button>
      )}
    </div>
  );
}
