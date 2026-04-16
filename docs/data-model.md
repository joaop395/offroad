# Data Model

Banco: **SQLite** via **Prisma ORM**. Schema em `backend/prisma/schema.prisma`.

## Modelos

### Admin
Usuário do painel admin. Apenas 1 admin, criado via seed.

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK autoincrement |
| email | String (unique) | E-mail de login |
| passwordHash | String | bcrypt rounds 12 |
| createdAt | DateTime | Data de criação |

### Event
Evento de trilha gerenciado pelo admin.

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK autoincrement |
| name | String | Nome do evento |
| date | DateTime | Data/hora do evento |
| location | String | Local |
| classification | Classification | Enum de classificação |
| priceAdult | Float | Valor por adulto (R$) |
| priceChild | Float | Valor por criança (R$) |
| maxSlots | Int | Vagas máximas totais (adultos + crianças), obrigatório em todas as classificações |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Última atualização |

### PartnerEvent
Evento informativo de terceiros/parceiros. Não participa do fluxo de inscrição nem de pagamento.

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK autoincrement |
| name | String | Nome do evento |
| date | DateTime | Data/hora do evento |
| description | String | Texto descritivo obrigatório |
| location | String? | Local opcional |
| bannerUrl | String? | URL pública do banner enviado pelo admin |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Última atualização |

### Registration
Inscrição confirmada após pagamento aprovado pelo Mercado Pago.

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK autoincrement |
| eventId | Int | FK → Event |
| responsibleName | String | Nome do responsável |
| responsiblePhone | String | Telefone (WhatsApp) |
| email | String | E-mail do responsável |
| adults | Int | Quantidade de adultos |
| children | Int | Quantidade de crianças |
| totalPaid | Float | Total pago (calculado no backend) |
| mpPaymentId | String (unique) | ID do pagamento no Mercado Pago |
| paidAt | DateTime | Data/hora do pagamento |

### Settings
Configurações globais do sistema. Sempre 1 registro (id=1).

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK fixo = 1 |
| whatsappNumber | String | Número do admin para link wa.me |

## Enum Classification

| Valor | Label no card | Cor |
|---|---|---|
| LEVE_4X4 | Leve 4x4 | #27AE60 |
| LEVE_AT_4X4 | Leve · Pneu AT | #2ECC71 |
| MODERADA_AT | Moderada · Pneu AT | #D4682A |
| MODERADA_MUD | Moderada · Pneu Mud | #E67E22 |
| AVANCADA | Avançada · Lift | #C0392B |
| REUNIAO | Reunião | #4C6A92 |

## Migrations

```bash
# Criar nova migration após alterar schema.prisma
npm run db:migrate

# Aplicar em produção (sem criar nova migration)
npm run db:deploy
```

## Notas de segurança

- Vagas disponíveis: calculadas em runtime (`maxSlots - SUM(adults + children)`) — nunca cacheadas, sempre consistentes
- `mpPaymentId` tem constraint UNIQUE — garante idempotência no webhook
- `onDelete: Cascade` em Registration → ao deletar evento, inscrições são removidas junto
- `PartnerEvent` é separado de `Event` para não misturar conteúdo informativo com fluxo transacional
