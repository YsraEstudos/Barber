import type { Barber, Service, Slot } from "@/lib/types";
import { priceFromCents, formatFullDate } from "@/app/_lib/booking-formatters";
import type { Step } from "@/app/_lib/booking-types";

type ReviewStepProps = {
  selectedBarber?: Barber | { id: string; name: string; bio: string; avatar_url: null; active: boolean } | null;
  selectedService?: Service | null;
  selectedSlot?: Slot | null;
  clientName: string;
  whatsapp: string;
  notes: string;
  setStep: (step: Step) => void;
};

export function ReviewStep({
  selectedBarber,
  selectedService,
  selectedSlot,
  clientName,
  whatsapp,
  notes,
  setStep,
}: ReviewStepProps) {
  return (
    <div className="bento-grid">
      {/* CARD 1: BARBER & SERVICE */}
      <div className="bento-card pro-service">
        <div className="bento-card-header">
          <span className="bento-card-label">Profissional e Serviço</span>
          <button type="button" className="bento-card-edit" onClick={() => setStep("service")}>Editar</button>
        </div>

        <div className="bento-barber-info">
          <div className="bento-barber-img">
            {selectedBarber?.avatar_url ? (
              <div
                className="avatar-image"
                role="img"
                aria-label={selectedBarber.name}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${selectedBarber.avatar_url})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
            ) : (
              <div className="w-full h-full bg-surface-container-highest flex items-center justify-center font-bold text-primary text-xs">
                {selectedBarber?.name?.slice(0, 2).toUpperCase() || "??"}
              </div>
            )}
          </div>
          <span className="bento-barber-name">{selectedBarber?.name}</span>
        </div>

        <div className="bento-service-info">
          <div>
            <div className="bento-service-name">{selectedService?.name}</div>
            <div className="bento-service-duration">{selectedService?.duration_minutes} min</div>
          </div>
          <div className="bento-service-price">
            {selectedService ? priceFromCents(selectedService.price_cents) : ""}
          </div>
        </div>
      </div>

      {/* CARD 2: DATE & TIME */}
      <div className="bento-card">
        <div className="bento-card-header">
          <span className="bento-card-label">Data e Hora</span>
          <button type="button" className="bento-card-edit" onClick={() => setStep("date")}>Editar</button>
        </div>

        <div className="bento-card-row">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="bento-card-row-text">
            {selectedSlot ? formatFullDate(selectedSlot.date) : "Não selecionado"}
          </span>
        </div>

        <div className="bento-card-row">
          <span className="material-symbols-outlined">schedule</span>
          <span className="bento-card-row-text">
            {selectedSlot ? selectedSlot.label : "Não selecionado"}
          </span>
        </div>
      </div>

      {/* CARD 3: CLIENT DETAILS */}
      <div className="bento-card">
        <div className="bento-card-header">
          <span className="bento-card-label">Seus Dados</span>
          <button type="button" className="bento-card-edit" onClick={() => setStep("name")}>Editar</button>
        </div>

        <div className="bento-card-row">
          <span className="material-symbols-outlined">person</span>
          <span className="bento-card-row-text">{clientName}</span>
        </div>

        <div className="bento-card-row">
          <span className="material-symbols-outlined">phone</span>
          <span className="bento-card-row-text">{whatsapp}</span>
        </div>

        {notes && (
          <div className="bento-card-row notes-row">
            <span className="material-symbols-outlined">notes</span>
            <span className="bento-card-row-text notes-text">
              {notes}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
