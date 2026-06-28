import type { Appointment, AppointmentStatus } from "@/lib/types";
import { formatCurrencyFromCents, formatPanelDate } from "../_lib/dashboard-formatters";

const statusActions: Array<{ status: AppointmentStatus; label: string; className: string; wide?: boolean }> = [
  { status: "confirmado", label: "Confirmado", className: "confirmado" },
  { status: "em_atendimento", label: "Em Cadeira", className: "em_atendimento" },
  { status: "finalizado", label: "Finalizado", className: "finalizado" },
  { status: "cancelado", label: "Cancelado", className: "cancelado" },
  { status: "nao_compareceu", label: "Não Compareceu (Falta)", className: "nao_compareceu", wide: true },
];

type AppointmentDetailsModalProps = {
  appointment: Appointment;
  onClose: () => void;
  onStatusChange: (status: AppointmentStatus) => void;
};

export function AppointmentDetailsModal({ appointment, onClose, onStatusChange }: AppointmentDetailsModalProps) {
  const price = formatCurrencyFromCents(appointment.price_cents);
  const appointmentDate = formatPanelDate(appointment.appointment_date);

  function openWhatsapp() {
    const cleanNumber = appointment.client_whatsapp.replace(/\D/g, "");
    const formattedNumber = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;
    window.open(`https://wa.me/${formattedNumber}`, "_blank");
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(event) => event.stopPropagation()}>
        <div className="modalHeader">
          <h3>Detalhes do Horário</h3>
          <button className="closeModalBtn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modalBody">
          <div className="infoRow">
            <span className="material-symbols-outlined">person</span>
            <div className="infoText">
              <label>Cliente</label>
              <p style={{ fontWeight: "700" }}>{appointment.client_name}</p>
            </div>
          </div>

          <div className="infoRow">
            <span className="material-symbols-outlined">content_cut</span>
            <div className="infoText">
              <label>Serviço & Preço</label>
              <p>
                {appointment.service_name} •{" "}
                <span style={{ color: "var(--primary)", fontWeight: "600" }}>{price}</span>
              </p>
            </div>
          </div>

          <div className="infoRow">
            <span className="material-symbols-outlined">schedule</span>
            <div className="infoText">
              <label>Data & Horário</label>
              <p>
                {appointmentDate} às {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
              </p>
            </div>
          </div>

          {appointment.notes && (
            <div className="infoRow">
              <span className="material-symbols-outlined">subject</span>
              <div className="infoText" style={{ width: "100%" }}>
                <label>Notas Especiais</label>
                <div className="notesBox">{appointment.notes}</div>
              </div>
            </div>
          )}

          <button className="whatsappActionBtn" onClick={openWhatsapp}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chat</span>
            Chamar no WhatsApp
          </button>

          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "8px 0" }} />

          <div>
            <div className="statusActionsLabel">Mudar Status do Atendimento</div>
            <div className="statusBtnGrid">
              {statusActions.map((action) => (
                <button
                  key={action.status}
                  className={`statusActionBtn ${action.className} ${appointment.status === action.status ? "active-status" : ""}`}
                  style={action.wide ? { gridColumn: "span 2" } : undefined}
                  onClick={() => onStatusChange(action.status)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
