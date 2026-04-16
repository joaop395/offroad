# API — Eventos

Base URL: `http://localhost:3001`

## Rotas públicas

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
    "isBookable": true,
    "classification": "MODERADA_AT",
    "priceAdult": 150,
    "priceChild": 75,
    "maxSlots": 30,
    "slotsUsed": 12,
    "availableSlots": 18
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
    "classification": "MODERADA_AT",
    "priceAdult": 150.00,
    "priceChild": 75.00,
    "maxSlots": 30,
    "slotsUsed": 12,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### GET /api/own-events/:id/slots

Vagas disponíveis em tempo real.

**Resposta 200:**
```json
{ "maxSlots": 30, "slotsUsed": 12, "available": 18 }
```

---

## Rotas admin (requerem `Authorization: Bearer <token>`)

### POST /api/own-events

**Body:**
```json
{
  "name": "Trilha da Cachoeira",
  "date": "2026-04-20T08:00:00.000Z",
  "location": "Serra do Mar",
  "classification": "MODERADA_AT",
  "priceAdult": 150.00,
  "priceChild": 75.00,
  "maxSlots": 30
}
```

**Classificações válidas:** `LEVE_4X4` | `LEVE_AT_4X4` | `MODERADA_AT` | `MODERADA_MUD` | `AVANCADA` | `REUNIAO`

**Observação:** `maxSlots` é obrigatório em todas as classificações.

**Resposta 201:** objeto do evento criado

---

### PUT /api/own-events/:id

Mesmo body do POST. Substitui todos os campos.

**Resposta 200:** objeto do evento atualizado

---

### DELETE /api/own-events/:id

**Resposta 200:**
```json
{ "ok": true }
```

> Deletar um evento remove todas as inscrições associadas (CASCADE).

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
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rali Noturno",
    "date": "2026-05-04T19:00:00.000Z",
    "location": "Interior SP",
    "classification": "AVANCADA",
    "priceAdult": 200,
    "priceChild": 0,
    "maxSlots": 20
  }' | jq

# Ver inscritos
curl http://localhost:3001/api/own-events/1/registrations \
  -H "Authorization: Bearer $TOKEN" | jq
```
