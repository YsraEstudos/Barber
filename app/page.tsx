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

const stepCopy: Record<Step, { title: string; subtitle: string; kicker: string }> = {
  service: {
    kicker: "Passo 1 de 8",
    title: "Escolha o Serviço",
    subtitle: "Selecione o serviço ideal para o seu visual hoje.",
  },
  barber: {
    kicker: "Passo 2 de 8",
    title: "Escolha o Barbeiro",
    subtitle: "Escolha seu profissional de preferência ou a primeira vaga livre.",
  },
  date: {
    kicker: "Passo 3 de 8",
    title: "Escolha o Dia",
    subtitle: "Selecione uma data para a sua sessão de cuidados premium.",
  },
  time: {
    kicker: "Passo 4 de 8",
    title: "Escolha o Horário",
    subtitle: "Selecione um horário disponível para o dia escolhido.",
  },
  name: {
    kicker: "Passo 5 de 8",
    title: "Seu Nome",
    subtitle: "Como devemos chamar você na barbearia?",
  },
  whatsapp: {
    kicker: "Passo 6 de 8",
    title: "Seu WhatsApp",
    subtitle: "Utilizaremos para enviar confirmações e lembretes.",
  },
  notes: {
    kicker: "Passo 7 de 8",
    title: "Algum detalhe extra?",
    subtitle: "Diga se você tem alguma preferência especial ou alergias.",
  },
  review: {
    kicker: "Passo 8 de 8",
    title: "Confirme seu horário",
    subtitle: "Revise todos os detalhes antes de finalizar a reserva.",
  },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
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

function formatFullDate(date: string) {
  return fullDateFormatter.format(new Date(`${date}T12:00:00`));
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function getShortWeekday(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return weekdays[date.getDay()];
}

function getDayNumber(dateStr: string) {
  return dateStr.split("-")[2];
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

  // Calendar month state
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [serviceId, services],
  );

  const selectedBarber = useMemo(() => {
    if (barberId === "any") {
      return {
        id: "any",
        name: "Qualquer Barbeiro",
        bio: "Mostrar o primeiro horário disponível",
        avatar_url: null,
        active: true,
      };
    }
    return barbers.find((barber) => barber.id === barberId);
  }, [barberId, barbers]);

  const selectedDay = useMemo(
    () => availability.find((day) => day.date === selectedDate),
    [availability, selectedDate],
  );

  // Align month view to first available date on load
  useEffect(() => {
    if (availability.length > 0) {
      const firstDate = new Date(`${availability[0].date}T12:00:00`);
      setCurrentYear(firstDate.getFullYear());
      setCurrentMonth(firstDate.getMonth());
    }
  }, [availability]);

  // Load initial options
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
        setError("Não foi possível carregar os dados de agendamento.");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  // Fetch availability when service or barber changes
  useEffect(() => {
    async function loadAvailability() {
      const queryBarberId = barberId === "any" ? (barbers[0]?.id ?? "") : barberId;
      if (!serviceId || !queryBarberId) {
        return;
      }

      setLoadingSlots(true);
      setError("");
      setSelectedSlot(null);

      try {
        const params = new URLSearchParams({ serviceId, barberId: queryBarberId });
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
            : "Não foi possível carregar horários.",
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailability();
  }, [serviceId, barberId, barbers]);

  // Wizard navigation
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
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }

    goNext();
  }

  // Handle WhatsApp input formatting
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length === 0) {
      setWhatsapp("");
      return;
    }
    if (cleanValue.length <= 2) {
      setWhatsapp(`(${cleanValue}`);
      return;
    }
    if (cleanValue.length <= 7) {
      setWhatsapp(`(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`);
      return;
    }
    setWhatsapp(`(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`);
  };

  // Submit booking data
  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSlot || !selectedService || !selectedBarber) {
      setError("Escolha serviço, barbeiro, dia e horário para continuar.");
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
          barberId: barberId === "any" ? (barbers[0]?.id ?? "") : barberId,
          date: selectedSlot.date,
          startTime: selectedSlot.start_time,
          clientName,
          whatsapp: onlyDigits(whatsapp),
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
          : "Não foi possível confirmar o agendamento.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Month navigation helpers
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const monthLabel = useMemo(() => {
    const tempDate = new Date(currentYear, currentMonth, 1);
    const label = tempDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [currentYear, currentMonth]);

  // Calendar cells mapping
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const cells: { dateStr: string | null; dayNumber: number; status: 'disabled' | 'available' | 'booked' | 'selected' }[] = [];
    
    // Previous month padding
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dateStr: null, dayNumber: 0, status: 'disabled' });
    }
    
    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = availability.find((d) => d.date === dateStr);
      
      let status: 'disabled' | 'available' | 'booked' | 'selected' = 'disabled';
      if (dateStr === selectedDate) {
        status = 'selected';
      } else if (dayData) {
        status = dayData.slots.length > 0 ? 'available' : 'booked';
      }
      
      cells.push({ dateStr, dayNumber: day, status });
    }
    
    return cells;
  }, [currentYear, currentMonth, availability, selectedDate]);

  // Adjacent dates list (horizontal scrolling top bar for step 4)
  const availableDaysWithSlots = useMemo(() => {
    return availability.filter((day) => day.slots.length > 0);
  }, [availability]);

  // Time slot grouping for step 4
  const groupedSlots = useMemo(() => {
    if (!selectedDay) return { morning: [], afternoon: [], evening: [] };
    
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];
    
    selectedDay.slots.forEach((slot) => {
      const hour = parseInt(slot.start_time.split(":")[0], 10);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 18) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });
    
    return { morning, afternoon, evening };
  }, [selectedDay]);

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
              <span className="summaryBox-value">({summary.whatsapp.slice(0, 2)}) {summary.whatsapp.slice(2, 7)}-{summary.whatsapp.slice(7, 11)}</span>
            </div>
            {summary.notes ? (
              <div className="summaryBox-item" style={{ flexDirection: "column", gap: "4px" }}>
                <span className="summaryBox-label">Observações</span>
                <span className="summaryBox-value" style={{ fontWeight: "normal", fontSize: "13px" }}>{summary.notes}</span>
              </div>
            ) : null}
          </div>
          
          <button className="primaryButton w-full" onClick={() => window.location.reload()} style={{ flex: "none" }}>
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
            <div style={{ width: "32px" }} /> // Spacer to balance header
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
          {step === "service" ? (
            <div className="choiceList">
              {loadingOptions ? (
                <p className="muted">Carregando serviços...</p>
              ) : (
                services.map((service) => {
                  const isSelected = service.id === serviceId;
                  const isPremium = service.id === "combo-vip" || service.price_cents >= 7000;
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
          ) : null}

          {/* STEP 2: BARBER */}
          {step === "barber" ? (
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
                        <img src={barber.avatar_url} alt={barber.name} />
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
                  className={`barber-card any-barber ${barberId === "any" ? "selected" : ""}`}
                  onClick={() => {
                    setBarberId("any");
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
                  <div className="barber-card-indicator" style={{ top: "auto", bottom: "16px", right: "16px", transform: barberId === "any" ? "scale(1)" : "scale(0.5)" }}>
                    <span className="material-symbols-outlined">check</span>
                  </div>
                </button>
              )}
            </div>
          ) : null}

          {/* STEP 3: DATE */}
          {step === "date" ? (
            <div className="calendar-container">
              <div className="month-picker">
                <button type="button" className="month-picker-btn" onClick={prevMonth} aria-label="Mês anterior">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="month-title">{monthLabel}</span>
                <button type="button" className="month-picker-btn" onClick={nextMonth} aria-label="Próximo mês">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <div className="calendar-grid">
                <div className="calendar-weekday">Dom</div>
                <div className="calendar-weekday">Seg</div>
                <div className="calendar-weekday">Ter</div>
                <div className="calendar-weekday">Qua</div>
                <div className="calendar-weekday">Qui</div>
                <div className="calendar-weekday">Sex</div>
                <div className="calendar-weekday">Sáb</div>

                {calendarCells.map((cell, idx) => {
                  if (cell.dayNumber === 0) {
                    return <div key={`empty-${idx}`} />;
                  }

                  const isSelected = cell.status === 'selected';
                  const isAvailable = cell.status === 'available';
                  const isBooked = cell.status === 'booked';
                  
                  return (
                    <button
                      type="button"
                      key={`day-${cell.dayNumber}`}
                      className={`calendar-day-btn ${isSelected ? "selected" : ""} ${isBooked ? "fully-booked" : ""}`}
                      disabled={cell.status === 'disabled' || isBooked}
                      onClick={() => {
                        if (cell.dateStr) {
                          setSelectedDate(cell.dateStr);
                          setSelectedSlot(null);
                          goNext("time");
                        }
                      }}
                    >
                      <span>{cell.dayNumber}</span>
                      {isAvailable && <span className="day-dot" />}
                    </button>
                  );
                })}
              </div>

              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="dot available" />
                  <span>Disponível</span>
                </div>
                <div className="legend-item">
                  <span className="line-booked" />
                  <span>Ocupado</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* STEP 4: TIME */}
          {step === "time" ? (
            <div className="flex flex-col">
              <div className="date-context-scroll">
                {availableDaysWithSlots.map((day) => {
                  const isActive = day.date === selectedDate;
                  return (
                    <button
                      type="button"
                      key={day.date}
                      className={`date-context-card ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setSelectedSlot(null);
                      }}
                    >
                      <span className="weekday">{getShortWeekday(day.date)}</span>
                      <span className="day">{getDayNumber(day.date)}</span>
                    </button>
                  );
                })}
              </div>

              {loadingSlots ? (
                <p className="muted text-center py-8">Carregando horários...</p>
              ) : selectedDay?.slots.length ? (
                <div className="space-y-6">
                  {/* MORNING SLOTS */}
                  {groupedSlots.morning.length > 0 && (
                    <div className="time-slots-group">
                      <h3 className="time-slots-group-header">
                        <span className="material-symbols-outlined">light_mode</span>
                        Manhã
                      </h3>
                      <div className="time-slots-grid">
                        {groupedSlots.morning.map((slot) => {
                          const isSelected = selectedSlot?.date === slot.date && selectedSlot?.start_time === slot.start_time;
                          return (
                            <button
                              type="button"
                              key={slot.start_time}
                              className={`time-slot-btn ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedSlot(slot);
                                goNext("name");
                              }}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AFTERNOON SLOTS */}
                  {groupedSlots.afternoon.length > 0 && (
                    <div className="time-slots-group">
                      <h3 className="time-slots-group-header">
                        <span className="material-symbols-outlined">wb_sunny</span>
                        Tarde
                      </h3>
                      <div className="time-slots-grid">
                        {groupedSlots.afternoon.map((slot) => {
                          const isSelected = selectedSlot?.date === slot.date && selectedSlot?.start_time === slot.start_time;
                          return (
                            <button
                              type="button"
                              key={slot.start_time}
                              className={`time-slot-btn ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedSlot(slot);
                                goNext("name");
                              }}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* EVENING SLOTS */}
                  {groupedSlots.evening.length > 0 && (
                    <div className="time-slots-group">
                      <h3 className="time-slots-group-header">
                        <span className="material-symbols-outlined">dark_mode</span>
                        Noite
                      </h3>
                      <div className="time-slots-grid">
                        {groupedSlots.evening.map((slot) => {
                          const isSelected = selectedSlot?.date === slot.date && selectedSlot?.start_time === slot.start_time;
                          return (
                            <button
                              type="button"
                              key={slot.start_time}
                              className={`time-slot-btn ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedSlot(slot);
                                goNext("name");
                              }}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="muted text-center py-8">Nenhum horário disponível para este dia.</p>
              )}
            </div>
          ) : null}

          {/* STEP 5: NAME */}
          {step === "name" ? (
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
          ) : null}

          {/* STEP 6: WHATSAPP */}
          {step === "whatsapp" ? (
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
          ) : null}

          {/* STEP 7: NOTES */}
          {step === "notes" ? (
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
          ) : null}

          {/* STEP 8: REVIEW */}
          {step === "review" ? (
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
                      <img src={selectedBarber.avatar_url} alt={selectedBarber.name} />
                    ) : (
                      <div className="w-full h-full bg-surface-container-highest flex items-center justify-center font-bold text-primary text-xs">
                        {selectedBarber?.name.slice(0, 2).toUpperCase()}
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
                  <div className="bento-card-row" style={{ marginTop: "8px", alignItems: "flex-start" }}>
                    <span className="material-symbols-outlined">notes</span>
                    <span className="bento-card-row-text" style={{ fontSize: "13px", fontWeight: "normal", color: "var(--on-surface-variant)" }}>
                      {notes}
                    </span>
                  </div>
                )}
              </div>
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
