import type { ActiveTab, DashboardUser } from "../_lib/dashboard-types";

type BarberHeaderProps = {
  user: DashboardUser;
  onLogout: () => void;
  isOffline?: boolean;
  showInstallBtn?: boolean;
  onInstall?: () => void;
};

export function BarberHeader({
  user,
  onLogout,
  isOffline,
  showInstallBtn,
  onInstall,
}: BarberHeaderProps) {
  return (
    <header className="barberHeader">
      <div className="headerBrand">
        <h2>Aureum <span>Grooming</span></h2>
      </div>
      <div className="headerActions">
        {showInstallBtn && onInstall && (
          <button className="installBtn" onClick={onInstall}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              install_mobile
            </span>
            Instalar App
          </button>
        )}
        {isOffline && (
          <div className="offlineBadge">
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--error)" }}>
              wifi_off
            </span>
            Offline
          </div>
        )}
        <div className="barberBadge">
          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--primary)" }}>
            {user.role === "admin" ? "shield_person" : "content_cut"}
          </span>
          {user.name} ({user.role === "admin" ? "Dono/Admin" : "Barbeiro"})
        </div>
        <button className="logoutBtn" onClick={onLogout}>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
          Sair
        </button>
      </div>
    </header>
  );
}

type NavigationTabsProps = {
  activeTab: ActiveTab;
  userRole: string;
  onTabChange: (tab: ActiveTab) => void;
};

export function NavigationTabs({ activeTab, userRole, onTabChange }: NavigationTabsProps) {
  return (
    <nav className="navigationTabs">
      <button
        className={`navTabButton ${activeTab === "agenda" ? "active" : ""}`}
        onClick={() => onTabChange("agenda")}
      >
        <span className="material-symbols-outlined">calendar_today</span>
        Agenda
      </button>

      <button
        className={`navTabButton ${activeTab === "servicos" ? "active" : ""}`}
        onClick={() => onTabChange("servicos")}
      >
        <span className="material-symbols-outlined">style</span>
        Serviços
      </button>

      <button
        className={`navTabButton ${activeTab === "horarios" ? "active" : ""}`}
        onClick={() => onTabChange("horarios")}
      >
        <span className="material-symbols-outlined">schedule</span>
        Horários & Bloqueios
      </button>

      {userRole === "admin" && (
        <button
          className={`navTabButton ${activeTab === "faturamento" ? "active" : ""}`}
          onClick={() => onTabChange("faturamento")}
        >
          <span className="material-symbols-outlined">monetization_on</span>
          Faturamento
        </button>
      )}
    </nav>
  );
}
