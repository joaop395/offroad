# Pagamentos — Mercado Pago

## Fluxo completo

```
1. Usuário clica "Inscrever-se" → modal em 4 passos
2. No passo final clica "Pagar agora"
3. Frontend → POST /api/payments/checkout (eventId, adults, children, name, phone, email)
4. Backend calcula total, valida vagas, cria Preference no MP
5. Backend retorna { initPoint, preferenceId }
6. Frontend redireciona para initPoint (checkout hospedado do MP)
7. Usuário paga (PIX ou cartão) no ambiente do MP
8. MP redireciona o usuário para uma das rotas:
   - `/inscricao/sucesso?payment_id=...`
   - `/inscricao/pendente?payment_id=...`
   - `/inscricao/erro?payment_id=...`
9. MP dispara webhook → POST /api/payments/webhook
10. Backend valida assinatura → consulta status na API do MP → salva Registration
11. As páginas de retorno exibem o status; somente a de sucesso mostra CTA de WhatsApp
```

## Configuração de credenciais

### Sandbox (testes)

1. Acesse https://www.mercadopago.com.br/developers
2. Crie uma aplicação → aba **Credenciais** → copie o **Access Token de TEST**
3. No `backend/.env`:
   ```
   MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxx
   ```

### Produção

1. Na mesma tela, copie o **Access Token de PRODUÇÃO** (começa com `APP_USR-`)
2. Substitua no `.env` de produção

### Webhook

1. No painel MP Developers → **Webhooks** → adicione sua URL:
   ```
   https://seudominio.com/api/payments/webhook
   ```
2. Selecione evento: `payment`
3. Copie a **chave secreta** gerada
4. No `backend/.env`:
   ```
   MP_WEBHOOK_SECRET=sua-chave-secreta
   ```

## Testando em sandbox

O MP fornece [cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/cards):

| Cartão | Resultado |
|---|---|
| 5031 4332 1540 6351 | Aprovado |
| 4170 0688 1010 8020 | Recusado |
| 5031 7557 3453 0604 | Pendente |

Use qualquer CVV e data futura.

## Testando o webhook localmente

Use [ngrok](https://ngrok.com/) para expor o backend:

```bash
ngrok http 3001
# Copie a URL https gerada e configure no painel MP como notification_url
```

## Segurança

- `ACCESS_TOKEN` somente no `backend/.env` — **nunca no frontend ou git**
- Valor da inscrição calculado no backend com base no `priceAdult`/`priceChild` do banco — frontend não envia preço
- Webhook verifica assinatura `X-Signature` via HMAC-SHA256
- Consulta status na API do MP antes de confirmar (não confia só no payload)
- `mpPaymentId` com constraint UNIQUE — previne processamento duplicado
- O backend aceita metadados do pagamento em `camelCase` e `snake_case` para manter compatibilidade no webhook

## Variáveis de ambiente necessárias

```env
MP_ACCESS_TOKEN=TEST-xxx       # ou APP_USR-xxx em produção
MP_WEBHOOK_SECRET=xxx          # chave do painel MP Developers
FRONTEND_URL=https://seusite.com  # para redirects e CORS
BACKEND_URL=https://api.seusite.com  # para notification_url do MP
```
