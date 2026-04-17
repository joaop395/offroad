# Backend — Setup

## Estrutura

```
backend/
├── prisma/
│   ├── schema.prisma     ← modelos e enums
│   ├── seed.js           ← cria admin inicial e Settings
│   └── migrations/       ← histórico de migrations
├── src/
│   ├── index.js          ← servidor Express (entry point)
│   ├── lib/
│   │   └── prisma.js     ← cliente Prisma singleton
│   │   ├── calendarEvents.js      ← normalização pública do calendário
│   │   └── partnerEventUploads.js ← upload/local path de banners
│   ├── middleware/
│   │   └── auth.js       ← JWT verify middleware
│   └── routes/
│       ├── auth.js       ← /api/auth/*
│       ├── events.js     ← /api/own-events/* (alias legado: /api/events/*)
│       ├── calendar-events.js ← /api/calendar-events
│       ├── partner-events.js  ← /api/partner-events/*
│       ├── payments.js   ← /api/payments/*
│       └── settings.js   ← /api/settings
├── uploads/
│   └── partner-events/   ← banners enviados pelo admin
├── .env                  ← variáveis locais (não commitado)
├── .env.example          ← template das variáveis
└── package.json
```

## Pré-requisitos

- Node.js 18+
- npm 10+

## Instalação

```bash
cd backend
npm install
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Caminho do arquivo SQLite (`file:./dev.db`) |
| `JWT_SECRET` | Secret para access tokens (gere com `openssl rand -hex 64`) |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens (diferente do anterior) |
| `ADMIN_EMAIL` | E-mail do admin (usado no seed) |
| `ADMIN_PASSWORD` | Senha do admin (usada no seed) |
| `MP_ACCESS_TOKEN` | Token do Mercado Pago (TEST-xxx para sandbox) |
| `MP_WEBHOOK_SECRET` | Chave secreta para verificar webhooks do MP |
| `FRONTEND_URL` | URL do frontend (para CORS e redirects do MP) |
| `BACKEND_URL` | URL pública do backend (para notification_url do MP) |
| `PORT` | Porta do servidor (padrão: 3001) |

## Scripts

```bash
npm run dev          # inicia com hot-reload (node --watch)
npm start            # produção
npm run db:migrate   # cria/aplica migrations
npm run db:deploy    # aplica migrations em produção
npm run db:seed      # cria admin e garante Settings iniciais
npm run db:studio    # abre Prisma Studio no browser
```

## Primeira execução

```bash
# 1. Configurar variáveis
cp .env.example .env
# edite .env com suas credenciais

# 2. Rodar migration
npm run db:migrate

# 3. Criar admin
npm run db:seed

# 4. Iniciar servidor
npm run dev
```

## Observações de arquitetura

- Eventos próprios usam `classification` como enum canônico no lugar de `difficulty`
- A rota pública principal para UI é `GET /api/calendar-events`
- A rota canônica de eventos próprios é `/api/own-events`
- `/api/events` permanece apenas como alias legado de compatibilidade
- Eventos parceiros têm CRUD separado e não entram no fluxo de inscrição/pagamento
- A rota pública `/atolado-do-mes` é frontend-only e usa assets estáticos em `public/media/atolado-do-mes`
