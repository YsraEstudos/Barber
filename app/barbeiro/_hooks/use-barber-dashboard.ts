"use client";

import { useCallback, useState, useEffect, useMemo } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
import type { Barber, Service, Appointment, AppointmentStatus, AvailabilityConfig, HolidayBlock } from "@/lib/types";
import { ANY_BARBER_ID } from "@/lib/types";
import type { ActiveTab, DashboardUser } from "../_lib/dashboard-types";
import { clearStoredSession, readStoredAppointments, readStoredAvailability, readStoredHolidayBlocks, readStoredSession, writeStoredAppointments, writeStoredAvailability, writeStoredHolidayBlocks, writeStoredSession } from "../_lib/dashboard-storage";
import { initializeDemoDashboardStorage } from "./use-demo-dashboard-data";
import { useLiveDashboardSync } from "./use-live-dashboard-sync";

export function useBarberDashboard() {
  // Estados de Autenticação
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loginError, setLoginError] = useState("");

  // Dados do System
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [adminAuthConfigured, setAdminAuthConfigured] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Estados do Dashboard
  const [activeTab, setActiveTab] = useState<ActiveTab>("agenda");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Estados de Edição/Criação de Serviços
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [serviceFormName, setServiceFormName] = useState("");
  const [serviceFormPrice, setServiceFormPrice] = useState("");
  const [serviceFormDuration, setServiceFormDuration] = useState("30");
  const [serviceFormDesc, setServiceFormDesc] = useState("");

  // Estados de Configuração de Horários
  const [availabilityList, setAvailabilityList] = useState<AvailabilityConfig[]>([]);
  const [holidayBlocks, setHolidayBlocks] = useState<HolidayBlock[]>([]);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  // Estados de Toast Notificação Realtime
  const [activeToast, setActiveToast] = useState<{ title: string; body: string; time: string } | null>(null);

  // Estados do PWA e Conectividade
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Auxiliares de Datas para a Timeline Semanal (7 dias a partir de hoje)
  const weekDays = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        dateStr: d.toISOString().slice(0, 10),
        dayNum: d.getDate(),
        weekDayLabel: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()]
      });
    }
    return dates;
  }, []);

  // Web Audio API Beep
  function playNotificationSound() {
    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextCtor) return;

      const ctx = new AudioContextCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio playback may be blocked until the user interacts with the page.
    }
  }

  // Monitoramento de conexão e instalação do PWA
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Registra o Service Worker para cache offline
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registrado com sucesso:", reg.scope))
        .catch((err) => console.error("Falha ao registrar Service Worker:", err));
    }

    const goOnline = () => {
      setIsOffline(false);
      setActiveToast({
        title: "Conectado",
        body: "Sua internet voltou! Atualizando dados em tempo real...",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      });
    };

    const goOffline = () => {
      setIsOffline(true);
      setActiveToast({
        title: "Modo Offline",
        body: "Sem internet. Exibindo dados salvos em cache.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      });
    };

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallBtn(true);
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  const loadLocalStates = useCallback(() => {
    const localApps = readStoredAppointments();
    if (localApps) setAppointments(localApps);

    const localAvail = readStoredAvailability();
    if (localAvail) setAvailabilityList(localAvail);

    const localBlocks = readStoredHolidayBlocks();
    if (localBlocks) setHolidayBlocks(localBlocks);
  }, []);

  const initMockData = useCallback((_servicesList: Service[], barbersList: Barber[]) => {
    initializeDemoDashboardStorage(barbersList);
    loadLocalStates();
  }, [loadLocalStates]);

  // Carrega opções iniciais e restaura sessão admin real quando configurada.
  useEffect(() => {
    async function loadOptions() {
      try {
        const [optionsResponse, sessionResponse] = await Promise.all([
          fetch("/api/options"),
          fetch("/api/barber/session"),
        ]);
        const data = await optionsResponse.json();
        const sessionData = await sessionResponse.json();

        setServices(data.services || []);
        setBarbers(data.barbers || []);
        
        // Cacheia os dados de serviços e barbeiros localmente para uso offline
        localStorage.setItem("aureum_cached_services", JSON.stringify(data.services || []));
        localStorage.setItem("aureum_cached_barbers", JSON.stringify(data.barbers || []));

        setAdminAuthConfigured(Boolean(sessionData.configured));
        setIsLiveMode(Boolean(data.configured && sessionData.configured && sessionData.user));
        if ((data.barbers || []).length > 0) {
          setSelectedBarberId(data.barbers[0].id);
        }

        if (sessionData.user) {
          setUser({
            id: "admin-id",
            name: sessionData.user.name,
            email: sessionData.user.email,
            role: sessionData.user.role,
          });
        } else if (!sessionData.configured) {
          const savedUser = readStoredSession();
          if (savedUser) {
            setUser(savedUser);
            setIsLiveMode(false);
            if (savedUser.role === "barber") {
              setSelectedBarberId(savedUser.id);
            }
          }
        }

        initMockData(data.services || [], data.barbers || []);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais (carregando cache offline):", err);
        
        // Fallback offline: lê do localStorage
        const cachedServices = localStorage.getItem("aureum_cached_services");
        const cachedBarbers = localStorage.getItem("aureum_cached_barbers");
        if (cachedServices) {
          setServices(JSON.parse(cachedServices));
        }
        if (cachedBarbers) {
          const parsedBarbers = JSON.parse(cachedBarbers) as Barber[];
          setBarbers(parsedBarbers);
          if (parsedBarbers.length > 0) {
            setSelectedBarberId(parsedBarbers[0].id);
          }
        }

        const savedUser = readStoredSession();
        if (savedUser) {
          setUser(savedUser);
          setIsLiveMode(false);
          if (savedUser.role === "barber") {
            setSelectedBarberId(savedUser.id);
          }
        }
      } finally {
        setLoadingData(false);
      }
    }
    loadOptions();
  }, [initMockData]);

  useLiveDashboardSync({
    user,
    isLiveMode,
    selectedDate,
    selectedBarberId,
    setAppointments,
    setAvailabilityList,
    setActiveToast,
    playNotificationSound,
  });

  // Simulação de Agendamentos Realtime (Modo Demo)
  useEffect(() => {
    if (!user || isLiveMode) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      if (Math.random() < 0.2) {
        const randomNames = ["Rodrigo Alves", "Bruno Lima", "Gabriel Souza", "Thiago Silva", "Lucas Cunha"];
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        const randomService = services[Math.floor(Math.random() * services.length)] || services[0];
        const randomBarber = barbers[Math.floor(Math.random() * barbers.length)] || barbers[0];
        
        const randomHours = ["10:30", "13:00", "15:30", "16:00", "17:00"];
        const randomHour = randomHours[Math.floor(Math.random() * randomHours.length)];
        const todayStr = new Date().toISOString().slice(0, 10);

        const newApp: Appointment = {
          id: "app-dyn-" + Date.now(),
          client_id: "client-dyn-" + Date.now(),
          client_name: randomName,
          client_whatsapp: "119" + Math.floor(10000000 + Math.random() * 90000000),
          barber_id: randomBarber.id,
          barber_name: randomBarber.name,
          service_id: randomService.id,
          service_name: randomService.name,
          appointment_date: todayStr,
          start_time: randomHour + ":00",
          end_time: randomHour + ":45",
          status: "confirmado",
          price_cents: randomService.price_cents,
          notes: "Agendado via Site do Cliente"
        };

        const list = readStoredAppointments() ?? [];
        list.push(newApp);
        writeStoredAppointments(list);
        setAppointments(list);

        playNotificationSound();
        setActiveToast({
          title: "Novo Agendamento Realizado!",
          body: `${randomName} agendou ${randomService.name} com ${randomBarber.name} às ${randomHour}.`,
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        });
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [user, isLiveMode, services, barbers]);

  // Limpa toast automaticamente
  useEffect(() => {
    if (activeToast) {
      const t = setTimeout(() => setActiveToast(null), 6000);
      return () => clearTimeout(t);
    }
  }, [activeToast]);

  // Filtra agendamentos da timeline
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((app) => app.appointment_date === selectedDate && app.barber_id === selectedBarberId)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [appointments, selectedDate, selectedBarberId]);

  // Métricas Consolidadas (Faturamento)
  const billingStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const barberAppointments = appointments.filter(
      (a) => !selectedBarberId || a.barber_id === selectedBarberId
    );

    const finished = barberAppointments.filter((a) => a.status === "finalizado");
    const active = barberAppointments.filter((a) => a.status === "confirmado" || a.status === "em_atendimento");
    
    const faturamentoTotal = finished.reduce((acc, curr) => acc + curr.price_cents, 0) / 100;
    const faturamentoHoje = finished.filter((a) => a.appointment_date === todayStr).reduce((acc, curr) => acc + curr.price_cents, 0) / 100;
    
    const serviceCounts: Record<string, number> = {};
    finished.forEach((a) => {
      serviceCounts[a.service_name] = (serviceCounts[a.service_name] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      faturamentoTotal,
      faturamentoHoje,
      atendimentosConcluidos: finished.length,
      agendamentosAtivos: active.length,
      topServices
    };
  }, [appointments, selectedBarberId]);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (isOffline) {
      setLoginError("Você precisa de uma conexão com a internet para fazer login pela primeira vez.");
      return;
    }

    try {
      const response = await fetch("/api/barber/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas.");
      }

      const isDemo = Boolean(data.isDemo);
      const authenticatedUser = {
        id: isDemo ? data.user.id : "admin-id",
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };

      setUser(authenticatedUser);
      setIsLiveMode(!isDemo);

      if (isDemo) {
        if (authenticatedUser.role === "barber") {
          setSelectedBarberId(authenticatedUser.id);
        } else if (barbers.length > 0) {
          setSelectedBarberId(barbers[0].id);
        }
        writeStoredSession(authenticatedUser);
      } else {
        if (barbers.length > 0) {
          setSelectedBarberId(barbers[0].id);
        }
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível entrar.");
    }
  };

  const handleLogout = async () => {
    if (adminAuthConfigured) {
      await fetch("/api/barber/session", { method: "DELETE" });
    }
    setUser(null);
    setIsLiveMode(false);
    clearStoredSession();
  };

  // Altera Status do Agendamento (Live ou Demo)
  const updateAppointmentStatus = async (status: AppointmentStatus) => {
    if (!selectedAppointment) return;

    if (isOffline) {
      setActiveToast({
        title: "Ação Bloqueada",
        body: "Sem internet. Não é possível alterar o status de agendamentos no momento.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      return;
    }

    if (isLiveMode) {
      try {
        const response = await fetch("/api/barber/appointments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: selectedAppointment.id,
            status,
            notes: selectedAppointment.notes
          })
        });
        if (!response.ok) throw new Error("Erro ao atualizar status");
      } catch (err) {
        console.error(err);
        alert("Não foi possível atualizar o status no banco de dados.");
        return;
      }
    }

    const updated = appointments.map((app) => {
      if (app.id === selectedAppointment.id) {
        const u = { ...app, status };
        setSelectedAppointment(u);
        return u;
      }
      return app;
    });

    setAppointments(updated);
    if (!isLiveMode) {
      writeStoredAppointments(updated);
    }
  };

  // Toggle de Serviço Ativo/Inativo (Live ou Demo)
  const handleToggleService = async (id: string) => {
    const srv = services.find((s) => s.id === id);
    if (!srv) return;
    const newActive = !srv.active;

    if (isOffline) {
      setActiveToast({
        title: "Ação Bloqueada",
        body: "Sem internet. Não é possível ativar/desativar serviços.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      return;
    }

    if (isLiveMode) {
      try {
        const response = await fetch("/api/barber/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, active: newActive })
        });
        if (!response.ok) throw new Error("Falha ao salvar");
      } catch (err) {
        console.error(err);
        alert("Erro ao salvar no banco de dados.");
        return;
      }
    }

    const updated = services.map((s) => (s.id === id ? { ...s, active: newActive } : s));
    setServices(updated);
  };

  // Salva ou Edita Serviço (Live ou Demo)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormName.trim() || !serviceFormPrice) return;

    if (isOffline) {
      setActiveToast({
        title: "Ação Bloqueada",
        body: "Sem internet. Não é possível criar ou editar serviços.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      return;
    }

    const priceCents = Math.round(parseFloat(serviceFormPrice.replace(",", ".")) * 100);

    if (isLiveMode) {
      try {
        if (editingService && editingService.id) {
          const response = await fetch("/api/barber/services", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: editingService.id,
              name: serviceFormName,
              price_cents: priceCents,
              duration_minutes: parseInt(serviceFormDuration),
              description: serviceFormDesc
            })
          });
          if (!response.ok) throw new Error();
          const data = await response.json();
          if (data.success) {
            const updated = services.map((s) => (s.id === editingService.id ? data.service : s));
            setServices(updated);
          }
        } else {
          const response = await fetch("/api/barber/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: serviceFormName,
              price_cents: priceCents,
              duration_minutes: parseInt(serviceFormDuration),
              description: serviceFormDesc
            })
          });
          if (!response.ok) throw new Error();
          const data = await response.json();
          if (data.success) {
            setServices([...services, data.service]);
          }
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao salvar serviço.");
        return;
      }
    } else {
      if (editingService && editingService.id) {
        const updated = services.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                name: serviceFormName,
                price_cents: priceCents,
                duration_minutes: parseInt(serviceFormDuration),
                description: serviceFormDesc
              }
            : s
        );
        setServices(updated);
      } else {
        const newService: Service = {
          id: "srv-" + Date.now(),
          name: serviceFormName,
          price_cents: priceCents,
          duration_minutes: parseInt(serviceFormDuration),
          description: serviceFormDesc,
          active: true
        };
        setServices([...services, newService]);
      }
    }

    setEditingService(null);
    setServiceFormName("");
    setServiceFormPrice("");
    setServiceFormDuration("30");
    setServiceFormDesc("");
  };

  // Remove Serviço
  const handleDeleteService = async (id: string) => {
    if (isOffline) {
      setActiveToast({
        title: "Ação Bloqueada",
        body: "Sem internet. Não é possível excluir serviços.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      return;
    }

    if (isLiveMode) {
      try {
        await fetch("/api/barber/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, active: false }) // Soft delete
        });
      } catch (err) {
        console.error(err);
      }
    }

    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
  };

  // Salva Ajuste de Disponibilidade (Grade Horária)
  const handleUpdateAvailability = async (weekday: number, updates: Partial<Pick<AvailabilityConfig, "start_time" | "end_time" | "active">>) => {
    if (isOffline) {
      setActiveToast({
        title: "Ação Bloqueada",
        body: "Sem internet. Não é possível alterar a disponibilidade.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      return;
    }

    const updated = availabilityList.map((a) =>
      a.weekday === weekday && a.barber_id === selectedBarberId ? { ...a, ...updates } : a
    );
    setAvailabilityList(updated);
    if (!isLiveMode) {
      writeStoredAvailability(updated);
    }

    if (isLiveMode) {
      try {
        const target = updated.find((a) => a.weekday === weekday && a.barber_id === selectedBarberId);
        if (!target) return;

        await fetch("/api/barber/availability", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barberId: selectedBarberId,
            weekday,
            start_time: target.start_time,
            end_time: target.end_time,
            active: target.active
          })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Adiciona Bloqueio de Horário
  const handleAddHolidayBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;

    if (isOffline) {
      setActiveToast({
        title: "Ação Bloqueada",
        body: "Sem internet. Não é possível bloquear horários.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      return;
    }

    const newBlock = {
      id: "block-" + Date.now(),
      barber_id: user?.role === "admin" ? ANY_BARBER_ID : selectedBarberId,
      block_date: newBlockDate,
      reason: newBlockReason.trim() || "Bloqueio Geral"
    };

    const updated = [...holidayBlocks, newBlock];
    setHolidayBlocks(updated);
    writeStoredHolidayBlocks(updated);

    setNewBlockDate("");
    setNewBlockReason("");
  };

  // Remove Bloqueio de Horário
  const handleRemoveHolidayBlock = (id: string | undefined) => {
    if (!id) return;

    if (isOffline) {
      setActiveToast({
        title: "Ação Bloqueada",
        body: "Sem internet. Não é possível remover bloqueios.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      return;
    }

    const updated = holidayBlocks.filter((b) => b.id !== id);
    setHolidayBlocks(updated);
    writeStoredHolidayBlocks(updated);
  };


  return {
    email,
    setEmail,
    password,
    setPassword,
    user,
    loginError,
    services,
    barbers,
    adminAuthConfigured,
    loadingData,
    activeTab,
    setActiveTab,
    selectedBarberId,
    setSelectedBarberId,
    selectedDate,
    setSelectedDate,
    appointments,
    selectedAppointment,
    setSelectedAppointment,
    editingService,
    setEditingService,
    serviceFormName,
    setServiceFormName,
    serviceFormPrice,
    setServiceFormPrice,
    serviceFormDuration,
    setServiceFormDuration,
    serviceFormDesc,
    setServiceFormDesc,
    availabilityList,
    holidayBlocks,
    newBlockDate,
    setNewBlockDate,
    newBlockReason,
    setNewBlockReason,
    activeToast,
    setActiveToast,
    weekDays,
    filteredAppointments,
    billingStats,
    handleLogin,
    handleLogout,
    updateAppointmentStatus,
    handleToggleService,
    handleSaveService,
    handleDeleteService,
    handleUpdateAvailability,
    handleAddHolidayBlock,
    handleRemoveHolidayBlock,
    isOffline,
    showInstallBtn,
    handleInstallApp,
  };
}
