# Segurança — Checklist e Medidas Implementadas

## Autenticação

| Medida | Implementado | Detalhe |
|---|---|---|
| Senha hasheada com bcrypt | ✅ | rounds: 12 |
| JWT de curta duração | ✅ | Access token: 15 min |
| Refresh token httpOnly | ✅ | 7 dias, Secure + SameSite=Strict |
| Rate limit no login | ✅ | 5 tentativas / 15 min por IP |
| Mensagem de erro genérica | ✅ | Nunca revela se e-mail existe |
| Timing-safe no login | ✅ | bcrypt roda mesmo para e-mails inexistentes |

## Headers HTTP (Helmet)

| Header | Valor |
|---|---|
| Content-Security-Policy | padrão Helmet |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| HSTS | includeSubDomains |
| Referrer-Policy | no-referrer |

## API

| Medida | Implementado | Detalhe |
|---|---|---|
| Rate limit global | ✅ | 100 req/min por IP |
| CORS restrito | ✅ | Apenas FRONTEND_URL |
| Validação Zod | ✅ | Todos os inputs antes de tocar no banco |
| Prisma parametrizado | ✅ | Zero SQL injection possível |
| Raw body no webhook | ✅ | Necessário para verificar assinatura MP |
| Contrato canônico de eventos próprios | ✅ | `/api/own-events` é a rota oficial; `/api/events` é apenas alias legado |
| Upload de banner validado | ✅ | Apenas imagem, limite de tamanho e persistência controlada |

## Pagamentos

| Medida | Implementado | Detalhe |
|---|---|---|
| Chave MP apenas no backend | ✅ | Nunca exposta no bundle JS |
| Valor calculado no backend | ✅ | Frontend não envia preço |
| Verificação de assinatura webhook | ✅ | HMAC-SHA256 X-Signature |
| Confirmação via API do MP | ✅ | Não confia só no payload |
| Idempotência | ✅ | mpPaymentId UNIQUE no banco |
| Verificação de vagas | ✅ | Checada no backend antes de criar preference |

## Frontend

| Medida | Implementado | Detalhe |
|---|---|---|
| Rota admin não linkada | ✅ | Não aparece no nav |
| robots.txt | ✅ | Bloqueia indexação de /offroad-admin |
| Token em sessionStorage | ✅ | Some ao fechar aba |
| Auto-refresh transparente | ✅ | Renova token sem logout forçado |
| Separação de domínios na UI | ✅ | Parceiros não exibem CTA de inscrição |

## Variáveis de ambiente

| Arquivo | Commitado? |
|---|---|
| `backend/.env` | ❌ No .gitignore |
| `.env` (frontend) | ❌ No .gitignore |
| `backend/.env.example` | ✅ Template documentado |
| `.env.example` (frontend) | ✅ Template documentado |

## Checklist de deploy

- [ ] Gerar JWT_SECRET e JWT_REFRESH_SECRET únicos: `openssl rand -hex 64`
- [ ] Trocar ADMIN_PASSWORD por senha forte antes do seed
- [ ] Rodar `npm run db:seed` apenas uma vez em produção
- [ ] Configurar FRONTEND_URL e BACKEND_URL corretos no `.env` de produção
- [ ] Usar Access Token de produção do MP (APP_USR-...)
- [ ] Configurar webhook no painel MP Developers com URL de produção
- [ ] Garantir HTTPS no backend (necessário para cookie Secure)
- [ ] Verificar que `backend/.env` e `prisma/dev.db` não estão no repositório
- [ ] Garantir persistência/backup de `backend/uploads/partner-events` em produção
