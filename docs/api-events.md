# API — Eventos

Base URL: `http://localhost:3001`

## Rotas públicas

### GET /api/events

Lista todos os eventos ordenados por data.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "name": "Trilha da Cachoeira",
    "date": "2026-04-20T08:00:00.000Z",
    "location": "Serra do Mar",
    "difficulty": "MODERADA_AT",
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

### GET /api/events/:id/slots

Vagas disponíveis em tempo real.

**Resposta 200:**
```json
{ "maxSlots": 30, "slotsUsed": 12, "available": 18 }
```

---

## Rotas admin (requerem `Authorization: Bearer <token>`)

### POST /api/events

**Body:**
```json
{
  "name": "Trilha da Cachoeira",
  "date": "2026-04-20T08:00:00.000Z",
  "location": "Serra do Mar",
  "difficulty": "MODERADA_AT",
  "priceAdult": 150.00,
  "priceChild": 75.00,
  "maxSlots": 30
}
```

**Dificuldades válidas:** `LEVE_4X4` | `LEVE_AT_4X4` | `MODERADA_AT` | `MODERADA_MUD` | `AVANCADA`

**Resposta 201:** objeto do evento criado

---

### PUT /api/events/:id

Mesmo body do POST. Substitui todos os campos.

**Resposta 200:** objeto do evento atualizado

---

### DELETE /api/events/:id

**Resposta 200:**
```json
{ "ok": true }
```

> Deletar um evento remove todas as inscrições associadas (CASCADE).

---

### GET /api/events/:id/registrations

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

## Testando com curl

```bash
# Listar eventos (público)
curl http://localhost:3001/api/events | jq

# Criar evento (admin)
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rali Noturno",
    "date": "2026-05-04T19:00:00.000Z",
    "location": "Interior SP",
    "difficulty": "AVANCADA",
    "priceAdult": 200,
    "priceChild": 0,
    "maxSlots": 20
  }' | jq

# Ver inscritos
curl http://localhost:3001/api/events/1/registrations \
  -H "Authorization: Bearer $TOKEN" | jq
```
