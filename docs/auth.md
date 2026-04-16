# Autenticação

## Fluxo JWT

```
POST /api/auth/login
  → access token (15min) no body
  → refresh token (7d) em cookie httpOnly

Authorization: Bearer <access_token>
  → usado em todas as rotas protegidas

POST /api/auth/refresh
  → lê refresh token do cookie
  → retorna novo access token + rotaciona refresh token

POST /api/auth/logout
  → limpa o cookie do refresh token
```

## Endpoints

### POST /api/auth/login

**Rate limit:** 5 tentativas / 15 min por IP

**Body:**
```json
{ "email": "admin@offroad.com", "password": "senha" }
```

**Resposta 200:**
```json
{ "accessToken": "eyJ..." }
```

**Resposta 401:**
```json
{ "error": "Credenciais inválidas." }
```

> A mensagem de erro é sempre genérica — não revela se o e-mail existe.

---

### POST /api/auth/refresh

Lê o cookie `refresh_token` automaticamente. Sem body.

**Resposta 200:**
```json
{ "accessToken": "eyJ..." }
```

---

### POST /api/auth/logout

Requer `Authorization: Bearer <token>`.

**Resposta 200:**
```json
{ "ok": true }
```

---

## Como usar o access token

```http
GET /api/own-events/1/registrations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testando com curl

```bash
# Login
TOKEN=$(curl -s -c cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@offroad.com","password":"TROQUE_ANTES_DE_USAR"}' \
  | jq -r .accessToken)

# Usar token
curl http://localhost:3001/api/own-events \
  -H "Authorization: Bearer $TOKEN"

# Refresh
curl -s -b cookies.txt -X POST http://localhost:3001/api/auth/refresh | jq

# Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Segurança implementada

- Senha hasheada com **bcrypt rounds 12**
- Timing-safe: bcrypt sempre roda mesmo se admin não existe (evita user enumeration)
- Refresh token em cookie `httpOnly; Secure; SameSite=Strict` — imune a XSS
- Access token de curta duração (15min) — minimiza janela de exposição
- Rate limit de login: 5 tentativas / 15 min por IP
