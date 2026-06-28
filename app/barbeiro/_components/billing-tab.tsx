import type { BillingStats } from "../_lib/dashboard-types";

type BillingTabProps = {
  billingStats: BillingStats;
};

export function BillingTab({ billingStats }: BillingTabProps) {
  return (
    <div className="tabContent animate-fade-up">
      <div className="billingMetrics">
        <div className="metricCard">
          <label>Faturamento Hoje</label>
          <p>{billingStats.faturamentoHoje.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        </div>
        <div className="metricCard">
          <label>Faturamento Consolidado</label>
          <p>{billingStats.faturamentoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        </div>
        <div className="metricCard">
          <label>Atendimentos Concluídos</label>
          <p style={{ color: "#81c784" }}>{billingStats.atendimentosConcluidos}</p>
        </div>
        <div className="metricCard">
          <label>Agendamentos Ativos</label>
          <p style={{ color: "var(--primary)" }}>{billingStats.agendamentosAtivos}</p>
        </div>
      </div>

      <div className="billingChartArea">
        <h4 className="billingChartTitle">Serviços Mais Procurados (Completados)</h4>
        <div className="rankingList">
          {billingStats.topServices.length === 0 ? (
            <p style={{ color: "var(--on-surface-variant)", fontSize: "14px" }}>Nenhum atendimento finalizado registrado ainda.</p>
          ) : (
            billingStats.topServices.map((service, index) => (
              <div key={service.name} className="rankingItem">
                <div className="rankingItemName">
                  <span style={{ color: "var(--primary)", marginRight: "8px", fontWeight: "700" }}>#{index + 1}</span>
                  {service.name}
                </div>
                <div className="rankingItemValue">{service.count} {service.count === 1 ? "atendimento" : "atendimentos"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
