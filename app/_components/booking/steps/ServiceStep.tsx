import type { Service } from "@/lib/types";
import { priceFromCents } from "@/app/_lib/booking-formatters";

type ServiceStepProps = {
  services: Service[];
  loadingOptions: boolean;
  serviceId: string;
  setServiceId: (id: string) => void;
  goNext: (step: "barber") => void;
};

export function ServiceStep({
  services,
  loadingOptions,
  serviceId,
  setServiceId,
  goNext,
}: ServiceStepProps) {
  return (
    <div className="choiceList">
      {loadingOptions ? (
        <p className="muted">Carregando serviços...</p>
      ) : (
        services.map((service) => {
          const isSelected = service.id === serviceId;
          // Check if premium based on price or name, avoiding hardcoded ID
          const isPremium =
            service.name.toLowerCase().includes("vip") || service.price_cents >= 7000;
          return (
            <button
              type="button"
              key={service.id}
              className={`service-card ${isSelected ? "selected" : ""} ${isPremium ? "premium-service" : ""}`}
              onClick={() => {
                setServiceId(service.id);
                goNext("barber");
              }}
            >
              <div className="service-card-header">
                <div className="service-card-title-group">
                  <h3 className="service-card-title">
                    {service.name}
                    {isPremium && <span className="premium-chip">Premium</span>}
                  </h3>
                  {service.description && <p className="service-card-desc">{service.description}</p>}
                </div>
                <span className="service-card-duration">
                  {service.duration_minutes >= 60
                    ? `${Math.floor(service.duration_minutes / 60)}h${service.duration_minutes % 60 > 0 ? ` ${service.duration_minutes % 60}m` : ""}`
                    : `${service.duration_minutes} min`}
                </span>
              </div>
              <div className="service-card-footer">
                <span className="service-card-price">{priceFromCents(service.price_cents)}</span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
