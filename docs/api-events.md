# API — Eventos

Base URL: `http://localhost:3001`

> Observação: a página pública `/atolado-do-mes` não consome API própria nesta fase; ela é uma experiência frontend com assets estáticos.

## Rotas públicas — Galeria & Patrocinadores

### GET /api/gallery

Lista imagens da galeria ordenadas por `order`.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "filename": "gallery-1712345678-abc123.jpg",
    "label": "Roteiros que ninguém conhece",
    "order": 0,
    "uploadedAt": "2026-05-11T12:00:00.000Z"
  }
]
```

**URL da imagem:** `resolveApiAssetUrl('/uploads/gallery/' + filename)` → `/api/uploads/gallery/...`

### GET /api/sponsors

Lista patrocinadores ordenados por `order`.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "filename": "sponsor-1712345678-abc123.png",
    "name": "Borracharia do Zé",
    "url": "https://instagram.com/...",
    "order": 0,
    "uploadedAt": "2026-05-11T12:00:00.000Z"
  }
]
```

**URL da imagem:** `resolveApiAssetUrl('/uploads/sponsors/' + filename)` → `/api/uploads/sponsors/...`

---

## Rotas públicas — Dicas

### GET /api/tips

Lista dicas publicadas (`published: true`) ordenadas por `order`.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "title": "Como preparar seu 4x4 para trilhas",
    "description": "Dicas essenciais de manutenção antes de pegar a estrada.",
    "youtubeUrl": "https://youtu.be/dQw4w9WgXcQ",
    "imageUrl": "/uploads/tips/tip-1712345678-abc123.jpg",
    "order": 0,
    "published": true,
    "createdAt": "2026-05-11T12:00:00.000Z",
    "updatedAt": "2026-05-11T12:00:00.000Z"
  }
]
```

**Thumbnail do YouTube:** `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg` (extraída no frontend)
**URL da imagem customizada:** `resolveApiAssetUrl(imageUrl)` → `/api/uploads/tips/...`

---

## Rotas públicas — Eventos

### GET /api/calendar-events

Lista unificada para a UI pública, misturando eventos próprios e parceiros em ordem cronológica.

**Resposta 200:**
```json
[
  {
    "kind": "own",
    "id": 1,
    "name": "Trilha da Cachoeira",
    "date": "2026-04-20T08:00:00.000Z",
    "location": "Serra do Mar",
    "description": null,
    "bannerUrl": null,
    "logoUrl": null,
    "isBookable": true,
    "isBeneficente": false,
    "classification": "MODERADA_AT",
    "priceAdult": 150,
    "priceChild": 75,
    "maxSlots": 30,
    "slotsUsed": 12,
    "availableSlots": 18
  },
  {
    "kind": "own",
    "id": 2,
    "name": "Rolê Beneficente",
    "date": "2026-08-01T10:00:00.000Z",
    "location": "Centro",
    "description": "Evento beneficente para transporte solidário.",
    "bannerUrl": null,
    "logoUrl": "/uploads/event-logos/logo-123.png",
    "isBookable": true,
    "isBeneficente": true,
    "classification": "REUNIAO",
    "priceAdult": 0,
    "priceChild": 0,
    "maxSlots": 0,
    "slotsUsed": 0,
    "availableSlots": 0
  },
  {
    "kind": "partner",
    "id": 3,
    "name": "Encontro 4x4 Serra Azul",
    "date": "2026-04-26T09:00:00.000Z",
    "location": null,
    "description": "Evento parceiro informativo.",
    "bannerUrl": "/uploads/partner-events/partner-123.png",
    "isBookable": false,
    "classification": null,
    "priceAdult": null,
    "priceChild": null,
    "maxSlots": null,
    "slotsUsed": null,
    "availableSlots": null
  }
]
```

### GET /api/own-events

Lista todos os eventos próprios ordenados por data.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "name": "Trilha da Cachoeira",
    "date": "2026-04-20T08:00:00.000Z",
    "location": "Serra do Mar",
    "description": null,
    "classification": "MODERADA_AT",
    "priceAdult": 150.00,
    "priceChild": 75.00,
    "maxSlots": 30,
    "isBeneficente": false,
    "logoUrl": null,
    "accountabilityImageUrl": null,
    "slotsUsed": 12,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### GET /api/own-events/:id

Retorna um evento próprio específico.

**Resposta 200:** objeto `Event` com `slotsUsed`

---

### GET /api/own-events/:id/slots

Vagas disponíveis em tempo real.

**Resposta 200:**
```json
{ "maxSlots": 30, "slotsUsed": 12, "available": 18 }
```

---

### POST /api/vehicle-registrations/:eventId

**Público.** Cadastra um veículo em evento beneficente.

**Body (JSON):**
```json
{
  "driverName": "João Silva",
  "cpf": "123.456.789-00",
  "plate": "ABC-1234",
  "availableSlots": 3
}
```

**Validação:**
- `driverName`: string, min 2, max 120
- `cpf`: formato `XXX.XXX.XXX-XX`
- `plate`: formato `ABC-1234` ou `ABC1D23`
- `availableSlots`: int, min 1, max 50

**Respostas:**
- **201:** veículo criado
- **400:** erro de validação
- **404:** evento não encontrado
- **409:** CPF já cadastrado neste evento

**Resposta 201:**
```json
{
  "id": 1,
  "eventId": 2,
  "driverName": "João Silva",
  "cpf": "123.456.789-00",
  "plate": "ABC-1234",
  "availableSlots": 3,
  "createdAt": "2026-08-01T10:00:00.000Z"
}
```

---

## Rotas admin — Galeria (requerem `Authorization: Bearer <token>`)

### POST /api/gallery

Aceita `multipart/form-data`.

**Campos:**
- `image` (obrigatório, imagem, max 5MB)
- `label` (obrigatório, texto)
- `order` (opcional, número)

**Resposta 201:** objeto `GalleryImage`

### PUT /api/gallery/:id

Aceita `multipart/form-data`. Para atualizar só label/order sem trocar imagem, não envie o campo `image`.

**Resposta 200:** objeto `GalleryImage` atualizado

### DELETE /api/gallery/:id

**Resposta 200:** `{ "ok": true }`

Remove o registro e o arquivo do disco.

---

## Rotas admin — Patrocinadores (requerem `Authorization: Bearer <token>`)

### POST /api/sponsors

Aceita `multipart/form-data`.

**Campos:**
- `image` (obrigatório, imagem, max 5MB)
- `name` (obrigatório, texto)
- `url` (opcional, link)
- `order` (opcional, número)

**Resposta 201:** objeto `Sponsor`

### PUT /api/sponsors/:id

Aceita `multipart/form-data`. Para atualizar só name/url/order sem trocar imagem, não envie o campo `image`.

**Resposta 200:** objeto `Sponsor` atualizado

### DELETE /api/sponsors/:id

**Resposta 200:** `{ "ok": true }`

Remove o registro e o arquivo do disco.

---

## Rotas admin — Dicas (requerem `Authorization: Bearer <token>`)

### GET /api/tips/all

Lista **todas** as dicas (incluindo rascunhos) ordenadas por `order`.

**Resposta 200:** array de `Tip` (mesmo formato do GET público, mas com `published: false` para rascunhos)

### POST /api/tips

Aceita `multipart/form-data`.

**Campos:**
- `title` (obrigatório, texto, max 120)
- `youtubeUrl` (obrigatório — aceita youtube.com/watch, youtu.be, shorts, embed)
- `description` (opcional, texto, max 2000)
- `image` (opcional, imagem PNG/JPG, max 5MB)
- `order` (opcional, número, default 0)
- `published` (opcional, boolean, default `true`)

**Validação:** URL do YouTube é extraída e normalizada para `https://youtu.be/VIDEO_ID`. Se inválida, retorna erro 400.

**Resposta 201:** objeto `Tip` criado

### PUT /api/tips/:id

Aceita `multipart/form-data`. Para atualizar sem trocar imagem, não envie o campo `image`.

**Campo extra:**
- `removeImage=true` para remover a imagem atual sem enviar outra

**Resposta 200:** objeto `Tip` atualizado

### PATCH /api/tips/reorder

Reordenação em lote (usado pelos botões ↑↓ do admin).

**Body:**
```json
{
  "items": [
    { "id": 1, "order": 0 },
    { "id": 2, "order": 1 },
    { "id": 3, "order": 2 }
  ]
}
```

**Resposta 200:** `{ "ok": true }`

### DELETE /api/tips/:id

**Resposta 200:** `{ "ok": true }`

Remove o registro e a imagem do disco.

---

## Rotas admin — Eventos (requerem `Authorization: Bearer <token>`)

### POST /api/own-events

Aceita `multipart/form-data` (upload de imagem + campos).

**Campos:**
- `name` (obrigatório, texto, max 120)
- `date` (obrigatório, ISO datetime)
- `location` (obrigatório, texto, max 200)
- `description` (opcional, texto, max 5000)
- `isBeneficente` (boolean, default `false`)
- `classification` (obrigatório se não beneficente — enum)
- `priceAdult` (obrigatório se não beneficente — número, >= 0)
- `priceChild` (obrigatório se não beneficente — número, >= 0)
- `maxSlots` (obrigatório se não beneficente — int, >= 0)
- `accountabilityImage` (opcional, imagem, max 5MB) — print prestação de contas
- `eventLogo` (opcional, imagem, max 5MB) — logo do evento beneficente
- `removeAccountabilityImage` (boolean)
- `removeLogo` (boolean)

**Classificações válidas:** `LEVE_4X4` | `LEVE_AT_4X4` | `MODERADA_AT` | `MODERADA_MUD` | `AVANCADA` | `REUNIAO`

**Regras beneficente:**
- Quando `isBeneficente=true`, classificação/précos/vagas são ignorados (definidos automaticamente como `REUNIAO`/0/0)
- O campo `eventLogo` é o logo do evento (exibido no painel admin e na página pública)
- O campo `description` é obrigatório para eventos beneficentes

**Resposta 201:** objeto do evento criado com `slotsUsed`

---

### PUT /api/own-events/:id

Mesmo formato do POST. Substitui todos os campos.

**Resposta 200:** objeto do evento atualizado

---

### DELETE /api/own-events/:id

**Resposta 200:**
```json
{ "ok": true }
```

> Deletar um evento remove todas as inscrições associadas (CASCADE) e veículos cadastrados.

---

### GET /api/own-events/:id/registrations

Lista inscrições confirmadas do evento.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "eventId": 1,
    "responsibleName": "João Silva",
    "responsiblePhone": "11999990000",
    "email": "joao@email.com",
    "adults": 2,
    "children": 1,
    "totalPaid": 375.00,
    "mpPaymentId": "123456789",
    "paidAt": "2026-04-10T14:32:00.000Z"
  }
]
```

### GET /api/own-events/:id/vehicles

Lista veículos cadastrados em evento beneficente (admin).

**Resposta 200:**
```json
[
  {
    "id": 1,
    "eventId": 2,
    "driverName": "João Silva",
    "cpf": "123.456.789-00",
    "plate": "ABC-1234",
    "availableSlots": 3,
    "createdAt": "2026-08-01T10:00:00.000Z"
  }
]
```

### DELETE /api/vehicle-registrations/:eventId/:vehicleId

Remove veículo cadastrado (admin).

**Resposta 200:** `{ "ok": true }`

---

### GET /api/partner-events

Lista eventos parceiros cadastrados no admin.

**Resposta 200:** array de `PartnerEvent`

---

### POST /api/partner-events

Cria evento parceiro. Aceita `multipart/form-data`.

**Campos:**
- `name` (obrigatório)
- `date` (obrigatório)
- `description` (obrigatório)
- `location` (opcional)
- `banner` (opcional, imagem)

**Resposta 201:** objeto do evento parceiro criado

---

### PUT /api/partner-events/:id

Atualiza evento parceiro. Aceita `multipart/form-data`.

**Campos extras:**
- `removeBanner=true` para remover o banner atual sem enviar outro

**Resposta 200:** objeto do evento parceiro atualizado

---

### DELETE /api/partner-events/:id

**Resposta 200:**
```json
{ "ok": true }
```

## Testando com curl

```bash
# Listar calendário público unificado
curl http://localhost:3001/api/calendar-events | jq

# Listar eventos próprios (público)
curl http://localhost:3001/api/own-events | jq

# Criar evento próprio (admin)
curl -X POST http://localhost:3001/api/own-events \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Rali Noturno" \
  -F "date=2026-05-04T19:00:00.000Z" \
  -F "location=Interior SP" \
  -F "classification=AVANCADA" \
  -F "priceAdult=200" \
  -F "priceChild=0" \
  -F "maxSlots=20" \
  -F "isBeneficente=false" \
  -F "removeAccountabilityImage=false" \
  -F "removeLogo=false" | jq

# Criar evento beneficente (admin)
curl -X POST http://localhost:3001/api/own-events \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Rolê Solidário" \
  -F "date=2026-08-01T10:00:00.000Z" \
  -F "location=Centro" \
  -F "description=Transporte solidário" \
  -F "isBeneficente=true" \
  -F "classification=REUNIAO" \
  -F "priceAdult=0" \
  -F "priceChild=0" \
  -F "maxSlots=0" \
  -F "removeAccountabilityImage=false" \
  -F "removeLogo=false" | jq

# Cadastrar veículo (público)
curl -X POST http://localhost:3001/api/vehicle-registrations/2 \
  -H "Content-Type: application/json" \
  -d '{
    "driverName": "João Silva",
    "cpf": "123.456.789-00",
    "plate": "ABC-1234",
    "availableSlots": 3
  }' | jq

# Listar veículos (admin)
curl http://localhost:3001/api/own-events/2/vehicles \
  -H "Authorization: Bearer $TOKEN" | jq

# Ver inscritos
curl http://localhost:3001/api/own-events/1/registrations \
  -H "Authorization: Bearer $TOKEN" | jq
```
