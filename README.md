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
- `SUPABASE_API_KEY`: chave publishable/anon usada pelas rotas de API do servidor para o fluxo publico de agendamento.
- `SUPABASE_SECRET_KEY`: opcional; chave secret `sb_secret_...` usada apenas em ambiente de servidor confiavel para habilitar as rotas live do painel `/barbeiro`.
- `BARBER_ADMIN_EMAIL`: email do administrador do painel live.
- `BARBER_ADMIN_PASSWORD`: senha do administrador do painel live.
- `BARBER_SESSION_SECRET`: segredo longo e aleatorio usado para assinar o cookie HttpOnly do painel.

Sem as variaveis do Supabase, a tela abre em modo demonstracao com dados locais, mas o botao de confirmacao fica bloqueado para evitar agendamento falso. Sem as variaveis `BARBER_*` e `SUPABASE_SECRET_KEY`, o painel `/barbeiro` permanece em modo demo e as rotas administrativas live ficam bloqueadas.

## Fluxo entregue

- Pagina inicial de agendamento.
- Servicos configuraveis pelo Supabase.
- Selecao de barbeiro.
- Dias e horarios livres com base na tabela `availability`.
- Formulario de nome, WhatsApp e observacoes.
- Validacao do horario antes de salvar.
- Gravacao nas tabelas `clients` e `appointments`.
- Tela de sucesso com resumo do horario.
