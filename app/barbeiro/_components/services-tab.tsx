import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Service } from "@/lib/types";
import type { DashboardUser } from "../_lib/dashboard-types";
import { formatCurrencyFromCents } from "../_lib/dashboard-formatters";

type ServicesTabProps = {
  user: DashboardUser;
  services: Service[];
  editingService: Partial<Service> | null;
  serviceFormName: string;
  serviceFormPrice: string;
  serviceFormDuration: string;
  serviceFormDesc: string;
  onSaveService: (event: FormEvent) => void;
  onToggleService: (id: string) => void;
  onDeleteService: (id: string) => void;
  onEditingServiceChange: Dispatch<SetStateAction<Partial<Service> | null>>;
  onNameChange: Dispatch<SetStateAction<string>>;
  onPriceChange: Dispatch<SetStateAction<string>>;
  onDurationChange: Dispatch<SetStateAction<string>>;
  onDescChange: Dispatch<SetStateAction<string>>;
};

export function ServicesTab({
  user,
  services,
  editingService,
  serviceFormName,
  serviceFormPrice,
  serviceFormDuration,
  serviceFormDesc,
  onSaveService,
  onToggleService,
  onDeleteService,
  onEditingServiceChange,
  onNameChange,
  onPriceChange,
  onDurationChange,
  onDescChange,
}: ServicesTabProps) {
  function resetForm() {
    onEditingServiceChange(null);
    onNameChange("");
    onPriceChange("");
    onDescChange("");
    onDurationChange("30");
  }

  function editService(service: Service) {
    onEditingServiceChange(service);
    onNameChange(service.name);
    onPriceChange((service.price_cents / 100).toFixed(2).replace(".", ","));
    onDurationChange(String(service.duration_minutes));
    onDescChange(service.description || "");
  }

  return (
    <div className="tabContent animate-fade-up">
      {user.role === "admin" && (
        <div className="configSection" style={{ marginBottom: "24px" }}>
          <h3>
            <span className="material-symbols-outlined">add_circle</span>
            {editingService ? "Editar Serviço" : "Novo Serviço"}
          </h3>
          <form onSubmit={onSaveService} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div className="inputGroup" style={{ flex: "2 1 200px", marginBottom: 0 }}>
                <label>Nome do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alinhamento de Barba"
                  value={serviceFormName}
                  onChange={(event) => onNameChange(event.target.value)}
                />
              </div>
              <div className="inputGroup" style={{ flex: "1 1 100px", marginBottom: 0 }}>
                <label>Preço (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="45,00"
                  value={serviceFormPrice}
                  onChange={(event) => onPriceChange(event.target.value)}
                />
              </div>
              <div className="inputGroup" style={{ flex: "1 1 100px", marginBottom: 0 }}>
                <label>Duração</label>
                <select value={serviceFormDuration} onChange={(event) => onDurationChange(event.target.value)}>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="75">75 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>
            </div>
            <div className="inputGroup" style={{ marginBottom: 0 }}>
              <label>Descrição (Opcional)</label>
              <textarea
                rows={2}
                placeholder="Breve explicação do serviço"
                value={serviceFormDesc}
                onChange={(event) => onDescChange(event.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              {editingService && (
                <button type="button" className="logoutBtn" style={{ border: "1px solid var(--outline)" }} onClick={resetForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="loginBtn" style={{ width: "auto", marginTop: 0 }}>
                Salvar Serviço
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="servicesGrid">
        {services.map((service) => (
          <div key={service.id} className={`serviceEditCard ${service.active ? "" : "inactive"}`}>
            <div className="serviceEditCardHeader">
              <div>
                <h4>{service.name}</h4>
                <div className="durationTag" style={{ marginTop: "4px" }}>
                  <span className="material-symbols-outlined">schedule</span>
                  {service.duration_minutes} min
                </div>
              </div>
              <span className="price">
                {formatCurrencyFromCents(service.price_cents)}
              </span>
            </div>

            {service.description && (
              <div className="serviceEditCardBody">
                <p>{service.description}</p>
              </div>
            )}

            <div className="serviceEditCardFooter">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label className="toggleSwitch">
                  <input
                    type="checkbox"
                    disabled={user.role !== "admin"}
                    checked={service.active}
                    onChange={() => onToggleService(service.id)}
                  />
                  <span className="toggleSlider"></span>
                </label>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>{service.active ? "Ativo" : "Pausado"}</span>
              </div>

              {user.role === "admin" && (
                <div className="serviceActions">
                  <button className="editServiceBtn" onClick={() => editService(service)}>
                    Editar
                  </button>
                  <button
                    className="editServiceBtn"
                    style={{ borderColor: "rgba(255,180,171,0.2)", color: "var(--error)" }}
                    onClick={() => onDeleteService(service.id)}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
