"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Appointment, AvailabilityConfig } from "@/lib/types";
import type { DashboardUser, ToastMessage } from "../_lib/dashboard-types";
import { supabase } from "@/lib/supabase-client";

type LiveDashboardSyncArgs = {
  user: DashboardUser | null;
  isLiveMode: boolean;
  selectedDate: string;
  selectedBarberId: string;
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
  setAvailabilityList: Dispatch<SetStateAction<AvailabilityConfig[]>>;
  setActiveToast: Dispatch<SetStateAction<ToastMessage | null>>;
  playNotificationSound: () => void;
};

export function useLiveDashboardSync({
  user,
  isLiveMode,
  selectedDate,
  selectedBarberId,
  setAppointments,
  setAvailabilityList,
  setActiveToast,
  playNotificationSound,
}: LiveDashboardSyncArgs) {
  useEffect(() => {
    if (!user || !isLiveMode || !selectedDate || !selectedBarberId) return;

    const controller = new AbortController();

    async function syncAppointments() {
      const cacheKey = `aureum_appointments_${selectedDate}_${selectedBarberId}`;
      try {
        const url = `/api/barber/appointments?date=${selectedDate}&barberId=${selectedBarberId}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Erro na rede");
        const data = (await response.json()) as { configured: boolean; appointments?: Appointment[] };

        if (data.configured && data.appointments) {
          const liveAppointments = data.appointments;
          // Salva no cache local para uso offline
          localStorage.setItem(cacheKey, JSON.stringify(liveAppointments));

          setAppointments((prev) => {
            const currentIds = new Set(prev.map((appointment) => appointment.id));
            const hasNew = liveAppointments.some((appointment) => !currentIds.has(appointment.id));

            if (hasNew && prev.length > 0) {
              const newlyAdded = liveAppointments.find((appointment) => !currentIds.has(appointment.id));
              if (newlyAdded) {
                playNotificationSound();
                setActiveToast({
                  title: "Novo Agendamento Realizado!",
                  body: `${newlyAdded.client_name} marcou ${newlyAdded.service_name} com ${newlyAdded.barber_name} às ${newlyAdded.start_time.slice(0, 5)}.`,
                  time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                });
              }
            }
            return liveAppointments;
          });
        }
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Erro ao sincronizar agendamentos live (tentando cache offline):", err);
          // Fallback offline
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              setAppointments(JSON.parse(cached) as Appointment[]);
            } catch (e) {
              console.error("Erro ao carregar cache de agendamentos offline:", e);
            }
          }
        }
      }
    }

    syncAppointments();

    const channel = supabase
      .channel("appointments-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          syncAppointments();
        }
      )
      .subscribe();

    const interval = setInterval(syncAppointments, 60000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      controller.abort();
    };
  }, [user, isLiveMode, selectedDate, selectedBarberId, setAppointments, setActiveToast, playNotificationSound]);

  useEffect(() => {
    if (!user || !isLiveMode || !selectedBarberId) return;

    const cacheKey = `aureum_availability_${selectedBarberId}`;
    async function fetchAvailability() {
      try {
        const response = await fetch(`/api/barber/availability?barberId=${selectedBarberId}`);
        if (!response.ok) throw new Error("Erro");
        const data = await response.json();
        if (data.configured && data.availability) {
          setAvailabilityList(data.availability);
          localStorage.setItem(cacheKey, JSON.stringify(data.availability));
        }
      } catch (err) {
        console.error("Erro ao buscar disponibilidade (tentando cache offline):", err);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setAvailabilityList(JSON.parse(cached));
          } catch (e) {
            console.error("Erro ao fazer parse da disponibilidade cacheada:", e);
          }
        }
      }
    }
    fetchAvailability();
  }, [user, isLiveMode, selectedBarberId, setAvailabilityList]);
}
