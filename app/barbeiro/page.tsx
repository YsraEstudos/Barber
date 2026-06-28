"use client";

import {
  AgendaTab,
  AppointmentDetailsModal,
  BillingTab,
  BarberHeader,
  LoadingPanel,
  LoginPanel,
  NavigationTabs,
  ScheduleTab,
  ServicesTab,
  ToastNotification,
} from "./_components";
import { useBarberDashboard } from "./_hooks/use-barber-dashboard";
import "./barbeiro.css";

export default function BarberDashboard() {
  const dashboard = useBarberDashboard();
  const {
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
  } = dashboard;

  if (loadingData) {
    return <LoadingPanel />;
  }

  if (!user) {
    return (
      <LoginPanel
        email={email}
        password={password}
        loginError={loginError}
        adminAuthConfigured={adminAuthConfigured}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="barberPanel">
      <div className="panelContainer">
        <BarberHeader
          user={user}
          onLogout={handleLogout}
          isOffline={isOffline}
          showInstallBtn={showInstallBtn}
          onInstall={handleInstallApp}
        />

        <NavigationTabs activeTab={activeTab} userRole={user.role} onTabChange={setActiveTab} />

        {/* --- CONTEÚDO DAS ABAS --- */}

        {/* ABA 1: AGENDA */}
        {activeTab === "agenda" && (
          <AgendaTab
            user={user}
            barbers={barbers}
            appointments={appointments}
            filteredAppointments={filteredAppointments}
            selectedBarberId={selectedBarberId}
            selectedDate={selectedDate}
            weekDays={weekDays}
            onSelectBarber={setSelectedBarberId}
            onSelectDate={setSelectedDate}
            onSelectAppointment={setSelectedAppointment}
          />
        )}

        {/* ABA 2: SERVIÇOS (CATÁLOGO) */}
        {activeTab === "servicos" && (
          <ServicesTab
            user={user}
            services={services}
            editingService={editingService}
            serviceFormName={serviceFormName}
            serviceFormPrice={serviceFormPrice}
            serviceFormDuration={serviceFormDuration}
            serviceFormDesc={serviceFormDesc}
            onSaveService={handleSaveService}
            onToggleService={handleToggleService}
            onDeleteService={handleDeleteService}
            onEditingServiceChange={setEditingService}
            onNameChange={setServiceFormName}
            onPriceChange={setServiceFormPrice}
            onDurationChange={setServiceFormDuration}
            onDescChange={setServiceFormDesc}
          />
        )}

        {/* ABA 3: HORÁRIOS & CONFIGURAÇÕES */}
        {activeTab === "horarios" && (
          <ScheduleTab
            user={user}
            selectedBarberId={selectedBarberId}
            availabilityList={availabilityList}
            holidayBlocks={holidayBlocks}
            newBlockDate={newBlockDate}
            newBlockReason={newBlockReason}
            onUpdateAvailability={handleUpdateAvailability}
            onAddHolidayBlock={handleAddHolidayBlock}
            onRemoveHolidayBlock={handleRemoveHolidayBlock}
            onBlockDateChange={setNewBlockDate}
            onBlockReasonChange={setNewBlockReason}
          />
        )}

        {/* ABA 4: FATURAMENTO (Admin) */}
        {activeTab === "faturamento" && user.role === "admin" && (
          <BillingTab billingStats={billingStats} />
        )}

      </div>

      {activeToast && (
        <ToastNotification toast={activeToast} onClose={() => setActiveToast(null)} />
      )}

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChange={updateAppointmentStatus}
        />
      )}

    </div>
  );
}
