"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Barber, BookingSummary, Service, Slot, AvailabilityDay } from "@/lib/types";
import { ANY_BARBER_ID } from "@/lib/types";
import { buildCalendarCells } from "@/app/_lib/booking-calendar";
import { onlyDigits } from "@/app/_lib/booking-formatters";
import { parseLocalDate } from "@/lib/scheduling";
import { steps, type Step } from "@/app/_lib/booking-types";

type OptionsResponse = {
  configured: boolean;
  services: Service[];
  barbers: Barber[];
};

export function useBookingFlow() {
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
    if (barberId === ANY_BARBER_ID) {
      return {
        id: ANY_BARBER_ID,
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
      const queryBarberId = barberId === ANY_BARBER_ID ? (barbers[0]?.id ?? "") : barberId;
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
        const nextSelectedDate = firstDay?.date ?? data.days[0]?.date ?? "";
        setSelectedDate(nextSelectedDate);
        if (nextSelectedDate) {
          const firstDate = parseLocalDate(nextSelectedDate);
          setCurrentYear(firstDate.getFullYear());
          setCurrentMonth(firstDate.getMonth());
        }
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

  // Wizard goBack
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
          barberId: barberId === ANY_BARBER_ID ? (barbers[0]?.id ?? "") : barberId,
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
    return buildCalendarCells(currentYear, currentMonth, availability, selectedDate);
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

  function resetFlow() {
    setStep("service");
    setServiceId(services[0]?.id ?? "");
    setBarberId(barbers[0]?.id ?? "");
    setSelectedDate("");
    setSelectedSlot(null);
    setClientName("");
    setWhatsapp("");
    setNotes("");
    setSummary(null);
    setError("");
  }

  return {
    step,
    setStep,
    resetFlow,
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
  };
}
