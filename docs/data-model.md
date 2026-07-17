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
| description | String? | Descrição do evento (obrigatória para beneficentes) |
| classification | Classification | Enum de classificação (default: REUNIAO) |
| priceAdult | Float | Valor por adulto (R$) — default 0 para beneficentes |
| priceChild | Float | Valor por criança (R$) — default 0 para beneficentes |
| maxSlots | Int | Vagas máximas totais — default 0 para beneficentes |
| isBeneficente | Boolean | `true` = evento beneficente (cadastro de veículos) |
| logoUrl | String? | URL do logo do evento beneficente em `/uploads/event-logos/` |
| accountabilityImageUrl | String? | URL do print da prestação de contas |
| registrations | Registration[] | Inscrições (eventos normais) |
| vehicleRegistrations | VehicleRegistration[] | Veículos cadastrados (eventos beneficentes) |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Última atualização |

### VehicleRegistration
Veículo cadastrado por cliente em evento beneficente. O cliente preenche seus dados via link público `/evento-beneficente/:eventId`.

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK autoincrement |
| eventId | Int | FK → Event (cascade delete) |
| driverName | String | Nome completo do motorista |
| cpf | String | CPF do motorista (formato XXX.XXX.XXX-XX) |
| plate | String | Placa do veículo (formato ABC-1234 ou ABC1D23) |
| availableSlots | Int | Vagas disponíveis no veículo |
| createdAt | DateTime | Data do cadastro |

**Regras:**
- Apenas eventos com `isBeneficente=true` aceitam cadastro
- Um mesmo CPF só pode se cadastrar uma vez por evento (único por evento)
- O cadastro é público (não requer autenticação)
- A exclusão é apenas admin (requer token)

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

### GalleryImage
Foto enviada pelo admin para a galeria da home. Exibida em grid 2x2 (mobile) / 3x3 (desktop) com lightbox ao clicar.

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK autoincrement |
| filename | String | Nome do arquivo em `/uploads/gallery/` |
| label | String | Legenda exibida no hover |
| order | Int | Ordem de exibição (ascendente) |
| uploadedAt | DateTime | Data de upload |

### Sponsor
Logo de patrocinador/apoiador. Exibido entre Galeria e Eventos na home. Logos em grayscale, ganham cor e escala no hover.

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK autoincrement |
| filename | String | Nome do arquivo em `/uploads/sponsors/` |
| name | String | Nome do patrocinador |
| url | String? | Link opcional (abre em nova aba) |
| order | Int | Ordem de exibição (ascendente) |
| uploadedAt | DateTime | Data de upload |

### Tip
Dica/vídeo do YouTube gerenciado pelo admin. Exibido publicamente em `/dicas` como grid de cards com embed.

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | PK autoincrement |
| title | String | Título da dica (max 120) |
| description | String? | Descrição opcional (max 2000) |
| youtubeUrl | String | URL canônica do YouTube (`https://youtu.be/VIDEO_ID`) |
| imageUrl | String? | URL da imagem de capa em `/uploads/tips/` |
| order | Int | Ordem de exibição (ascendente) |
| published | Boolean | `true` = visível publicamente; `false` = rascunho |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Última atualização |

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

## Eventos Beneficentes

Eventos beneficentes são uma variante de eventos próprios (`isBeneficente=true`) com fluxo diferente:

- **Não cobram inscrição** — são gratuitos
- **Não usam classificação/preço/vagas** — valores default 0
- **Possuem logo próprio** — upload via campo `eventLogo`
- **Aceitam cadastro de veículos** — via link público `/evento-beneficente/:id`
- **Card verde no calendário** e badge "Beneficente" no painel admin
- O link público é compartilhável (WhatsApp, redes sociais)

## Migrations

```bash
# Criar nova migration após alterar schema.prisma
npx prisma migrate dev --name <nome-da-migration>

# Aplicar em produção (sem criar nova migration)
npx prisma migrate deploy
```

## Notas de segurança

- Vagas disponíveis: calculadas em runtime (`maxSlots - SUM(adults + children)`) — nunca cacheadas, sempre consistentes
- `mpPaymentId` tem constraint UNIQUE — garante idempotência no webhook
- `onDelete: Cascade` em Registration → ao deletar evento, inscrições são removidas junto
- `onDelete: Cascade` em VehicleRegistration → ao deletar evento, veículos são removidos junto
- `PartnerEvent` é separado de `Event` para não misturar conteúdo informativo com fluxo transacional
- `Atolado do Mês` atualmente não usa tabela própria; a experiência é montada com assets estáticos públicos no frontend
- `GalleryImage`, `Sponsor` e `Tip` seguem o mesmo padrão de upload com multer + resolução de URL via `resolveApiAssetUrl()`
- Uploads ficam em `uploads/gallery/`, `uploads/sponsors/`, `uploads/tips/` e `uploads/event-logos/`, servidos estaticamente via `/api/uploads/`
- `Tip.published` filtra o que é visível publicamente — rascunhos só aparecem no admin
- URL do YouTube é normalizada pelo backend para formato canônico `https://youtu.be/VIDEO_ID`
- Cadastro de veículos: validação de CPF e placa no backend, limite de 5MB por imagem
