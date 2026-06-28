import type { ToastMessage } from "../_lib/dashboard-types";

type ToastNotificationProps = {
  toast: ToastMessage;
  onClose: () => void;
};

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  return (
    <div className="toastNotification">
      <span className="toastIcon material-symbols-outlined">notifications_active</span>
      <div className="toastBody">
        <h4>{toast.title}</h4>
        <p>{toast.body}</p>
        <span>{toast.time}</span>
      </div>
      <button
        type="button"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--on-surface-variant)",
          cursor: "pointer",
          marginLeft: "auto",
          paddingLeft: "8px",
          display: "flex",
          alignItems: "center",
        }}
        onClick={onClose}
        aria-label="Fechar notificação"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
      </button>
    </div>
  );
}
