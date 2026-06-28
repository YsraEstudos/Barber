"use client";

import { formatFullDate } from "@/app/_lib/booking-formatters";
import { stepCopy, steps } from "@/app/_lib/booking-types";
import { useBookingFlow } from "@/app/_hooks/use-booking-flow";

// Import isolated step components
import { ServiceStep } from "./steps/ServiceStep";
import { BarberStep } from "./steps/BarberStep";
import { DateStep } from "./steps/DateStep";
import { TimeStep } from "./steps/TimeStep";
import { ClientInfoStep } from "./steps/ClientInfoStep";
import { ReviewStep } from "./steps/ReviewStep";

export function BookingShell() {
  const flow = useBookingFlow();
  const {
    step,
    services,
    barbers,
    serviceId,
    setServiceId,
    barberId,
    setBarberId,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    clientName,
    setClientName,
    whatsapp,
    notes,
    setNotes,
    loadingOptions,
    loadingSlots,
    submitting,
    error,
    demoMode,
    summary,
    currentStepIndex,
    progress,
    selectedService,
    selectedBarber,
    selectedDay,
    goNext,
    goBack,
    continueFromInput,
    handleWhatsappChange,
    submitBooking,
    prevMonth,
    nextMonth,
    monthLabel,
    calendarCells,
    availableDaysWithSlots,
    groupedSlots,
    resetFlow,
  } = flow;

  if (summary) {
    return (
      <main className="successShell">
        <section className="successPanel animate-fade-up" aria-labelledby="success-title">
          <div className="brandMark-success">A</div>
          <span className="statusPill">Agendamento confirmado</span>
          <h1 id="success-title">Horário Reservado</h1>
          <p className="subtitle">Seu agendamento foi registrado com sucesso!</p>
          
          <div className="summaryBox">
            <div className="summaryBox-item">
              <span className="summaryBox-label">Serviço</span>
              <span className="summaryBox-value">{summary.serviceName}</span>
            </div>
            <div className="summaryBox-item">
              <span className="summaryBox-label">Profissional</span>
              <span className="summaryBox-value">{summary.barberName}</span>
            </div>
            <div className="summaryBox-item">
              <span className="summaryBox-label">Data e Hora</span>
              <span className="summaryBox-value">
                {formatFullDate(summary.date)} às {summary.startTime.slice(0, 5)}
              </span>
            </div>
            <div className="summaryBox-item">
              <span className="summaryBox-label">Cliente</span>
              <span className="summaryBox-value">{summary.clientName}</span>
            </div>
            <div className="summaryBox-item">
              <span className="summaryBox-label">WhatsApp</span>
              <span className="summaryBox-value">
                ({summary.whatsapp.slice(0, 2)}) {summary.whatsapp.slice(2, 7)}-{summary.whatsapp.slice(7, 11)}
              </span>
            </div>
            {summary.notes ? (
              <div className="summaryBox-item summaryBox-notes">
                <span className="summaryBox-label">Observações</span>
                <span className="summaryBox-value notes-text">{summary.notes}</span>
              </div>
            ) : null}
          </div>
          
          <button className="primaryButton w-full no-flex" onClick={resetFlow}>
            Fazer Novo Agendamento
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="bookingShell">
      <div className="ambient-glow" />
      <form className="bookingCard" onSubmit={submitBooking}>
        <header className="mobileTopbar">
          {currentStepIndex > 0 ? (
            <button type="button" aria-label="Voltar" className="back-btn" onClick={goBack}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : (
            <div className="header-spacer" />
          )}
          <h1>Agendamento Online</h1>
          <span className="stepCounter">
            {currentStepIndex + 1}/{steps.length}
          </span>
        </header>

        <div className="progressTrack" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>

        <section className="stepScreen animate-fade-up" key={step}>
          <div className="stepIntro">
            <span className="stepKicker">{stepCopy[step].kicker}</span>
            <h2>{stepCopy[step].title}</h2>
            <p>{stepCopy[step].subtitle}</p>
          </div>

          {demoMode ? (
            <div className="notice flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Modo Demonstração: Configure o arquivo .env com o Supabase para agendamentos reais.</span>
            </div>
          ) : null}
          
          {error ? (
            <div className="error flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>{error}</span>
            </div>
          ) : null}

          {/* STEP 1: SERVICE */}
          {step === "service" && (
            <ServiceStep
              services={services}
              loadingOptions={loadingOptions}
              serviceId={serviceId}
              setServiceId={setServiceId}
              goNext={goNext}
            />
          )}

          {/* STEP 2: BARBER */}
          {step === "barber" && (
            <BarberStep
              barbers={barbers}
              barberId={barberId}
              setBarberId={setBarberId}
              goNext={goNext}
            />
          )}

          {/* STEP 3: DATE */}
          {step === "date" && (
            <DateStep
              prevMonth={prevMonth}
              nextMonth={nextMonth}
              monthLabel={monthLabel}
              calendarCells={calendarCells}
              setSelectedDate={setSelectedDate}
              setSelectedSlot={setSelectedSlot}
              goNext={goNext}
            />
          )}

          {/* STEP 4: TIME */}
          {step === "time" && (
            <TimeStep
              availableDaysWithSlots={availableDaysWithSlots}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              setSelectedSlot={setSelectedSlot}
              loadingSlots={loadingSlots}
              selectedDay={selectedDay}
              groupedSlots={groupedSlots}
              selectedSlot={selectedSlot}
              goNext={goNext}
            />
          )}

          {/* STEPS 5, 6, 7: CLIENT INFO (NAME, WHATSAPP, NOTES) */}
          {(step === "name" || step === "whatsapp" || step === "notes") && (
            <ClientInfoStep
              step={step}
              clientName={clientName}
              setClientName={setClientName}
              whatsapp={whatsapp}
              handleWhatsappChange={handleWhatsappChange}
              notes={notes}
              setNotes={setNotes}
            />
          )}

          {/* STEP 8: REVIEW */}
          {step === "review" && (
            <ReviewStep
              selectedBarber={selectedBarber}
              selectedService={selectedService}
              selectedSlot={selectedSlot}
              clientName={clientName}
              whatsapp={whatsapp}
              notes={notes}
              setStep={flow.setStep}
            />
          )}
        </section>

        <footer className="stepFooter">
          <button
            className="ghostButton"
            disabled={currentStepIndex === 0 || submitting}
            onClick={goBack}
            type="button"
          >
            Voltar
          </button>

          {(step === "name" || step === "whatsapp" || step === "notes") ? (
            <button className="primaryButton" onClick={continueFromInput} type="button">
              Continuar
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : null}

          {step === "review" ? (
            <button
              className="primaryButton"
              disabled={submitting || demoMode}
              type="submit"
            >
              {submitting ? "Confirmando..." : "Confirmar"}
              <span className="material-symbols-outlined">check_circle</span>
            </button>
          ) : null}
        </footer>
      </form>
    </main>
  );
}
