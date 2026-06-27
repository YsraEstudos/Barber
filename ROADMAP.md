# Roadmap: Sistema de Agendamento para Barbearia

## Stack principal

- **Bot WhatsApp:** Evolution API + Node.js
- **Site de agendamento do cliente:** Next.js
- **App do barbeiro:** Next.js como PWA
- **Banco de dados, autenticacao e tempo real:** Supabase
- **Hospedagem sugerida:** VPS para Evolution API, Vercel para Next.js e Supabase Cloud para banco

---

## Fase 1: Fundacao do Projeto

**Objetivo:** preparar a base tecnica do sistema.

### Entregaveis

- Criar repositorio do projeto.
- Definir arquitetura geral:
  - Frontend cliente em Next.js.
  - Painel/app do barbeiro em Next.js PWA.
  - Backend Node.js para integracoes e regras de negocio.
  - Evolution API rodando em VPS.
  - Supabase como banco principal.
- Criar projeto no Supabase.
- Modelar tabelas iniciais:
  - `barbers`
  - `clients`
  - `services`
  - `appointments`
  - `availability`
  - `notifications`
- Configurar autenticacao para barbeiros.
- Configurar ambiente local com variaveis `.env`.

### Entregavel final

A base tecnica do projeto esta pronta para receber as funcionalidades principais.

---

## Fase 2: Site de Agendamento do Cliente

**Objetivo:** permitir que o cliente marque horario de forma simples e rapida.

### Funcionalidades

- Pagina inicial de agendamento.
- Selecao de servico:
  - Corte
  - Barba
  - Corte + Barba
  - Outros servicos configuraveis
- Selecao de barbeiro, se houver mais de um.
- Exibicao de dias e horarios disponiveis.
- Formulario com dados do cliente:
  - Nome
  - WhatsApp
  - Observacoes opcionais
- Confirmacao do agendamento.
- Gravacao do agendamento no Supabase.
- Tela de sucesso com resumo do horario.

### Entregavel final

Cliente consegue agendar pelo site e o horario fica salvo no banco.

---

## Fase 3: App PWA do Barbeiro

**Objetivo:** criar um painel instalavel no celular do barbeiro.

### Funcionalidades

- Login do barbeiro.
- Tela de agenda do dia.
- Tela de agenda semanal.
- Listagem de agendamentos.
- Detalhes do cliente e servico.
- Alterar status do agendamento:
  - Confirmado
  - Em atendimento
  - Finalizado
  - Cancelado
  - Nao compareceu
- Cadastro e edicao de servicos.
- Configuracao de horarios disponiveis.
- Bloqueio de datas ou horarios especificos.
- Instalacao como PWA no celular.

### Entregavel final

Barbeiro consegue instalar o app pelo navegador e gerenciar sua agenda.

---

## Fase 4: Realtime e Notificacoes Internas

**Objetivo:** fazer o app do barbeiro atualizar instantaneamente quando um cliente agenda.

### Funcionalidades

- Configurar Supabase Realtime na tabela `appointments`.
- Quando um novo agendamento for criado:
  - O app do barbeiro atualiza automaticamente.
  - Uma notificacao visual aparece.
  - Um som de alerta pode ser tocado.
- Criar historico de notificacoes no app.
- Marcar notificacoes como lidas.

### Entregavel final

O barbeiro recebe o novo agendamento em tempo real, sem precisar atualizar a pagina.

---

## Fase 5: Bot do WhatsApp com Evolution API

**Objetivo:** automatizar comunicacao com clientes via WhatsApp.

### Funcionalidades

- Instalar Evolution API em uma VPS.
- Conectar numero de WhatsApp via QR Code.
- Criar servico Node.js para enviar mensagens.
- Enviar confirmacao automatica apos agendamento.
- Enviar lembrete antes do horario:
  - 24h antes
  - 2h antes
- Enviar mensagem de cancelamento.
- Enviar mensagem de reagendamento.
- Criar endpoint para disparo manual de mensagens pelo app do barbeiro.

### Exemplos de mensagens

```text
Ola, Joao! Seu corte esta confirmado para amanha as 15:00 com o barbeiro Carlos.
```

```text
Lembrete: seu horario na barbearia e hoje as 16:30. Te esperamos!
```

### Entregavel final

Sistema envia mensagens automaticas pelo WhatsApp usando Evolution API.

---

## Fase 6: Fluxo Completo de Agendamento

**Objetivo:** conectar todas as partes em uma experiencia unica.

### Fluxo ideal

1. Cliente acessa o site.
2. Escolhe servico, barbeiro, data e horario.
3. Confirma o agendamento.
4. Supabase salva o horario.
5. App do barbeiro recebe atualizacao em tempo real.
6. Bot envia confirmacao pelo WhatsApp.
7. Antes do horario, bot envia lembrete automatico.
8. Barbeiro finaliza ou cancela o atendimento pelo app.

### Entregavel final

Produto funcionando ponta a ponta.

---

## Fase 7: Recursos Avancados

**Objetivo:** melhorar gestao, retencao e automacao.

### Funcionalidades futuras

- Reagendamento pelo cliente.
- Cancelamento pelo cliente.
- Lista de espera.
- Programa de fidelidade.
- Historico de atendimentos.
- Anotacoes sobre o cliente.
- Relatorios:
  - Faturamento diario
  - Servicos mais vendidos
  - Horarios mais movimentados
  - Taxa de nao comparecimento
- Multiplas unidades/barbearias.
- Pagamento antecipado via Pix.
- Integracao com Google Calendar.
- Campanhas automaticas via WhatsApp.

---

## Ordem Recomendada de Construcao

1. Banco de dados no Supabase.
2. Site de agendamento do cliente.
3. App PWA do barbeiro.
4. Realtime no app do barbeiro.
5. Integracao com Evolution API.
6. Lembretes automaticos.
7. Relatorios e recursos avancados.

---

## MVP Recomendado

Para lancar rapido, o MVP deve conter apenas:

- Site para o cliente agendar.
- Cadastro de servicos.
- Agenda do barbeiro.
- Notificacao em tempo real.
- Confirmacao por WhatsApp.
- Lembrete automatico antes do horario.

Com isso, o sistema ja resolve o problema principal: o cliente agenda sozinho, o barbeiro recebe na hora e o WhatsApp confirma automaticamente.
