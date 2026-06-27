# Site de Agendamento da Barbearia

Site em Next.js para o cliente escolher servico, barbeiro, dia, horario e confirmar o agendamento no Supabase.

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env.local` com base em `.env.example`.

3. No Supabase, execute o SQL em `supabase/schema.sql`.

4. Rode o projeto:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto no Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave service role usada apenas nas rotas de API do servidor.

Sem essas variaveis, a tela abre em modo demonstracao com dados locais, mas o botao de confirmacao fica bloqueado para evitar agendamento falso.

## Fluxo entregue

- Pagina inicial de agendamento.
- Servicos configuraveis pelo Supabase.
- Selecao de barbeiro.
- Dias e horarios livres com base na tabela `availability`.
- Formulario de nome, WhatsApp e observacoes.
- Validacao do horario antes de salvar.
- Gravacao nas tabelas `clients` e `appointments`.
- Tela de sucesso com resumo do horario.
