import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agendamento | Barbearia",
  description: "Agende seu horario na barbearia de forma rapida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
