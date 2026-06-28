import type { ChangeEvent } from "react";
import { onlyDigits } from "@/app/_lib/booking-formatters";

type ClientInfoStepProps = {
  step: "name" | "whatsapp" | "notes";
  clientName: string;
  setClientName: (name: string) => void;
  whatsapp: string;
  handleWhatsappChange: (e: ChangeEvent<HTMLInputElement>) => void;
  notes: string;
  setNotes: (notes: string) => void;
};

export function ClientInfoStep({
  step,
  clientName,
  setClientName,
  whatsapp,
  handleWhatsappChange,
  notes,
  setNotes,
}: ClientInfoStepProps) {
  if (step === "name") {
    return (
      <div className="center-content-box">
        <div className="premium-input-wrapper">
          <label htmlFor="user-name" className="premium-input-label">Nome Completo</label>
          <div className="premium-input-container">
            <input
              type="text"
              id="user-name"
              autoFocus
              className="premium-input"
              placeholder="Ex: João Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              autoComplete="name"
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === "whatsapp") {
    return (
      <div className="center-content-box">
        <div className="premium-input-wrapper">
          <label htmlFor="whatsapp" className="premium-input-label">Número de Telefone</label>
          <div className="premium-input-container with-prefix">
            <div className="premium-input-prefix">
              <span className="material-symbols-outlined">language</span>
              <span>+55</span>
            </div>
            <input
              type="tel"
              id="whatsapp"
              autoFocus
              inputMode="numeric" // Fixes mobile keyboard (UX/Accessibility)
              className="premium-input"
              placeholder="(00) 00000-0000"
              value={whatsapp}
              onChange={handleWhatsappChange}
              autoComplete="tel"
            />
            {onlyDigits(whatsapp).length >= 10 && (
              <div className="premium-input-validation-icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            )}
          </div>
          <p className="premium-input-note">
            <span className="material-symbols-outlined">lock</span>
            Seu número está seguro e será usado apenas para este agendamento.
          </p>
        </div>
      </div>
    );
  }

  if (step === "notes") {
    return (
      <div className="flex flex-col flex-1">
        <div className="textarea-wrapper">
          <span className="textarea-tag">Opcional</span>
          <textarea
            id="observations"
            autoFocus
            className="premium-textarea"
            placeholder="Ex: Por favor, não use pomada com brilho, apenas efeito matte. Tenho a pele sensível na região do pescoço..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 300))}
            rows={5}
          />
        </div>
        <div className="char-count">
          <span>{notes.length} / 300</span>
        </div>
      </div>
    );
  }

  return null;
}
