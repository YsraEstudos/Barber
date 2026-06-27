"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Barber, BookingSummary, Service, Slot } from "@/lib/types";

type OptionsResponse = {
  configured: boolean;
  services: Service[];
  barbers: Barber[];
};

type AvailabilityDay = {
  date: string;
  slots: Slot[];
};

type Step =
  | "service"
  | "barber"
  | "date"
  | "time"
  | "name"
  | "whatsapp"
  | "notes"
  | "review";

const steps: Step[] = [
  "service",
  "barber",
  "date",
  "time",
  "name",
  "whatsapp",
  "notes",
  "review",
];

const stepCopy: Record<Step, { title: string; subtitle: string }> = {
  service: {
    title: "Qual servico voce quer?",
    subtitle: "Escolha uma opcao para continuar.",
  },
  barber: {
    title: "Escolha o barbeiro",
    subtitle: "Se houver mais de um profissional, escolha aqui.",
  },
  date: {
    title: "Escolha o dia",
    subtitle: "Mostramos apenas os dias com agenda aberta.",
  },
  time: {
    title: "Escolha o horario",
    subtitle: "Horarios ocupados somem automaticamente.",
  },
  name: {
    title: "Qual e o seu nome?",
    subtitle: "Esse nome aparecera na agenda da barbearia.",
  },
  whatsapp: {
    title: "Seu WhatsApp",
    subtitle: "Informe com DDD para identificar seu agendamento.",
  },
  notes: {
    title: "Alguma observacao?",
    subtitle: "Esse campo e opcional.",
  },
  review: {
    title: "Confirme seu horario",
    subtitle: "Confira os dados antes de reservar.",
  },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function priceFromCents(value: number) {
  return currencyFormatter.format(value / 100);
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

function formatFullDate(date: string) {
  return fullDateFormatter.format(new Date(`${date}T12:00:00`));
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export default function Home() {
  const [step, setStep] = useState<Step>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [clientName, setClientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [summary, setSummary] = useState<BookingSummary | null>(null);

  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [serviceId, services],
  );
  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === barberId),
    [barberId, barbers],
  );
  const selectedDay = useMemo(
    () => availability.find((day) => day.date === selectedDate),
    [availability, selectedDate],
  );

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch("/api/options");
        const data = (await response.json()) as OptionsResponse;

        setServices(data.services);
        setBarbers(data.barbers);
        setDemoMode(!data.configured);
        setServiceId(data.services[0]?.id ?? "");
        setBarberId(data.barbers[0]?.id ?? "");
      } catch {
        setError("Nao foi possivel carregar os dados de agendamento.");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    async function loadAvailability() {
      if (!serviceId || !barberId) {
        return;
      }

      setLoadingSlots(true);
      setError("");
      setSelectedSlot(null);

      try {
        const params = new URLSearchParams({ serviceId, barberId });
        const response = await fetch(`/api/availability?${params.toString()}`);
        const data = (await response.json()) as {
          configured: boolean;
          days: AvailabilityDay[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message);
        }

        setDemoMode(!data.configured);
        setAvailability(data.days);
        const firstDay = data.days.find((day) => day.slots.length > 0);
        setSelectedDate(firstDay?.date ?? data.days[0]?.date ?? "");
      } catch (caughtError) {
        setAvailability([]);
        setSelectedDate("");
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Nao foi possivel carregar horarios.",
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailability();
  }, [serviceId, barberId]);

  function goNext(nextStep?: Step) {
    setError("");
    if (nextStep) {
      setStep(nextStep);
      return;
    }

    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    setStep(steps[nextIndex]);
  }

  function goBack() {
    setError("");
    const nextIndex = Math.max(currentStepIndex - 1, 0);
    setStep(steps[nextIndex]);
  }

  function continueFromInput() {
    if (step === "name" && clientName.trim().length < 2) {
      setError("Informe seu nome para continuar.");
      return;
    }

    if (step === "whatsapp" && onlyDigits(whatsapp).length < 10) {
      setError("Informe um WhatsApp valido com DDD.");
      return;
    }

    goNext();
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSlot || !selectedService || !selectedBarber) {
      setError("Escolha servico, barbeiro, dia e horario para continuar.");
      return;
    }

    if (clientName.trim().length < 2 || onlyDigits(whatsapp).length < 10) {
      setError("Confira seu nome e WhatsApp antes de confirmar.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          barberId,
          date: selectedSlot.date,
          startTime: selectedSlot.start_time,
          clientName,
          whatsapp,
          notes,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSummary(data as BookingSummary);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Nao foi possivel confirmar o agendamento.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (summary) {
    return (
      <main className="successShell">
        <section className="successPanel" aria-labelledby="success-title">
          <span className="brandMark">B</span>
          <span className="statusPill">Agendamento confirmado</span>
          <h1 id="success-title">Horario reservado</h1>
          <div className="summaryBox">
            <p>
              <strong>{summary.serviceName}</strong>
            </p>
            <p>{summary.barberName}</p>
            <p>
              {formatFullDate(summary.date)} as {summary.startTime.slice(0, 5)}
            </p>
            <p>
              {summary.clientName} | WhatsApp: {summary.whatsapp}
            </p>
            {summary.notes ? <p>Observacoes: {summary.notes}</p> : null}
          </div>
          <button className="primaryButton" onClick={() => window.location.reload()}>
            Fazer novo agendamento
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="bookingShell">
      <form className="bookingCard" onSubmit={submitBooking}>
        <header className="mobileTopbar">
          <span className="brandMark" aria-hidden="true">
            B
          </span>
          <div className="brandCopy">
            <p>Barbearia</p>
            <strong>Agendamento online</strong>
          </div>
          <span className="stepCounter">
            {currentStepIndex + 1}/{steps.length}
          </span>
        </header>

        <div className="progressTrack" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>

        <section className="stepScreen">
          <div className="stepIntro">
            <span className="stepKicker">Passo {currentStepIndex + 1}</span>
            <h1>{stepCopy[step].title}</h1>
            <p>{stepCopy[step].subtitle}</p>
          </div>

          <aside className="bookingSnapshot" aria-label="Resumo parcial">
            <div>
              <span>Servico</span>
              <strong>{selectedService?.name ?? "Selecione"}</strong>
            </div>
            <div>
              <span>Profissional</span>
              <strong>{selectedBarber?.name ?? "Selecione"}</strong>
            </div>
            <div>
              <span>Horario</span>
              <strong>{selectedSlot ? selectedSlot.label : "A definir"}</strong>
            </div>
          </aside>

          {demoMode ? (
            <div className="notice">
              Supabase ainda nao configurado. O fluxo abre para teste, mas a
              confirmacao real exige o arquivo .env.
            </div>
          ) : null}
          {error ? <div className="error">{error}</div> : null}

          {step === "service" ? (
            <div className="choiceList">
              {loadingOptions ? (
                <p className="muted">Carregando servicos...</p>
              ) : (
                services.map((service) => (
                  <button
                    className={
                      service.id === serviceId ? "choiceButton selected" : "choiceButton"
                    }
                    key={service.id}
                    onClick={() => {
                      setServiceId(service.id);
                      goNext("barber");
                    }}
                    type="button"
                  >
                    <span>
                      <strong>{service.name}</strong>
                      <small>{service.description}</small>
                    </span>
                    <em>
                      {service.duration_minutes} min | {priceFromCents(service.price_cents)}
                    </em>
                  </button>
                ))
              )}
            </div>
          ) : null}

          {step === "barber" ? (
            <div className="choiceList compact">
              {barbers.map((barber) => (
                <button
                  className={
                    barber.id === barberId ? "choiceButton selected" : "choiceButton"
                  }
                  key={barber.id}
                  onClick={() => {
                    setBarberId(barber.id);
                    goNext("date");
                  }}
                  type="button"
                >
                  <span>
                    <strong>{barber.name}</strong>
                    <small>{barber.bio || "Profissional disponivel"}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {step === "date" ? (
            <div className="dateList">
              {loadingSlots ? (
                <p className="muted">Buscando dias disponiveis...</p>
              ) : (
                availability.map((day) => (
                  <button
                    className={day.date === selectedDate ? "dateRow selected" : "dateRow"}
                    disabled={day.slots.length === 0}
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setSelectedSlot(null);
                      goNext("time");
                    }}
                    type="button"
                  >
                    <strong>{formatDate(day.date)}</strong>
                    <span>{day.slots.length} horarios</span>
                  </button>
                ))
              )}
            </div>
          ) : null}

          {step === "time" ? (
            <div className="slotGrid">
              {loadingSlots ? (
                <p className="muted">Buscando horarios...</p>
              ) : selectedDay?.slots.length ? (
                selectedDay.slots.map((slot) => (
                  <button
                    className={
                      selectedSlot?.date === slot.date &&
                      selectedSlot?.start_time === slot.start_time
                        ? "slotButton selected"
                        : "slotButton"
                    }
                    key={`${slot.date}-${slot.start_time}`}
                    onClick={() => {
                      setSelectedSlot(slot);
                      goNext("name");
                    }}
                    type="button"
                  >
                    {slot.label}
                  </button>
                ))
              ) : (
                <p className="muted">Nenhum horario disponivel neste dia.</p>
              )}
            </div>
          ) : null}

          {step === "name" ? (
            <div className="fieldScreen">
              <label>
                Nome
                <input
                  autoComplete="name"
                  autoFocus
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Seu nome"
                  value={clientName}
                />
              </label>
            </div>
          ) : null}

          {step === "whatsapp" ? (
            <div className="fieldScreen">
              <label>
                WhatsApp
                <input
                  autoComplete="tel"
                  autoFocus
                  inputMode="tel"
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                />
              </label>
            </div>
          ) : null}

          {step === "notes" ? (
            <div className="fieldScreen">
              <label>
                Observacoes
                <textarea
                  autoFocus
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Opcional"
                  rows={5}
                  value={notes}
                />
              </label>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="reviewList">
              <div>
                <span>Servico</span>
                <strong>{selectedService?.name}</strong>
              </div>
              <div>
                <span>Barbeiro</span>
                <strong>{selectedBarber?.name}</strong>
              </div>
              <div>
                <span>Horario</span>
                <strong>
                  {selectedSlot
                    ? `${formatFullDate(selectedSlot.date)} as ${selectedSlot.label}`
                    : "Nao selecionado"}
                </strong>
              </div>
              <div>
                <span>Cliente</span>
                <strong>{clientName}</strong>
              </div>
              <div>
                <span>WhatsApp</span>
                <strong>{whatsapp}</strong>
              </div>
              {notes ? (
                <div>
                  <span>Observacoes</span>
                  <strong>{notes}</strong>
                </div>
              ) : null}
            </div>
          ) : null}
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

          {step === "name" || step === "whatsapp" || step === "notes" ? (
            <button className="primaryButton" onClick={continueFromInput} type="button">
              Continuar
            </button>
          ) : null}

          {step === "review" ? (
            <button
              className="primaryButton"
              disabled={submitting || demoMode}
              type="submit"
            >
              {submitting ? "Confirmando..." : "Confirmar"}
            </button>
          ) : null}
        </footer>
      </form>
    </main>
  );
}
