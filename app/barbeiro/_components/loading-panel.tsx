type LoadingPanelProps = {
  message?: string;
};

export function LoadingPanel({ message = "Carregando painel..." }: LoadingPanelProps) {
  return (
    <div className="loginWrapper">
      <div className="loginCard">
        <h1>Aureum Grooming</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
