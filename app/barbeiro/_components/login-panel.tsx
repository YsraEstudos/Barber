import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";

type LoginPanelProps = {
  email: string;
  password: string;
  loginError: string;
  adminAuthConfigured: boolean;
  onEmailChange: Dispatch<SetStateAction<string>>;
  onPasswordChange: Dispatch<SetStateAction<string>>;
  onSubmit: (event: FormEvent) => void;
};

export function LoginPanel({
  email,
  password,
  loginError,
  adminAuthConfigured,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginPanelProps) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="loginWrapper">
      <div className="loginCard">
        <h1>Aureum Grooming</h1>
        <p>Painel Administrativo do Barbeiro</p>

        {loginError && <div className="loginError">{loginError}</div>}

        <form onSubmit={onSubmit}>
          <div className="inputGroup">
            <label>E-mail Corporativo</label>
            <input
              type="email"
              required
              placeholder="ex: admin@barber.com"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label>Senha de Acesso</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
          </div>

          <button type="submit" className="loginBtn">
            Entrar no Painel
          </button>
        </form>

        {!adminAuthConfigured && (
          <div style={{ marginTop: "24px", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                textDecoration: "underline",
              }}
            >
              {showDemo ? "Ocultar Contas de Demonstração" : "Ver Contas de Demonstração"}
            </button>
            {showDemo && (
              <div style={{ marginTop: "12px", fontSize: "11px", color: "var(--on-surface-variant)", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div>
                  <strong>Administrador:</strong>
                  <code style={{ display: "block", color: "var(--primary)", marginTop: "2px" }}>admin@barber.com / admin123</code>
                </div>
                <div>
                  <strong>Barbeiro (Carlos):</strong>
                  <code style={{ display: "block", color: "var(--primary)", marginTop: "2px" }}>carlos@barber.com / carlos123</code>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
