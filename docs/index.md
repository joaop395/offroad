# Specs

Este diretório centraliza as especificações funcionais e técnicas do projeto Offroad.

## Índice

- [Backend Setup](./backend-setup.md)  
  Setup local do backend, variáveis de ambiente, scripts e primeira execução.
- [Data Model](./data-model.md)  
  Estrutura do banco, entidades, relacionamentos e enums do sistema.
- [API - Eventos](./api-events.md)  
  Contratos das rotas públicas e protegidas relacionadas a eventos e inscrições.
- [Autenticação](./auth.md)  
  Fluxo JWT, refresh token, endpoints de sessão e medidas de segurança do login.
- [Pagamentos - Mercado Pago](./payments.md)  
  Fluxo de checkout, webhook, credenciais de teste e regras de persistência do pagamento.
- [Painel Admin](./admin-panel.md)  
  Acesso ao painel, navegação, sessão e comportamento das rotas administrativas.
- [Segurança](./security.md)  
  Checklist consolidado de autenticação, headers, API, webhook e hardening geral.

## Organização sugerida

- `backend-setup.md`: onboarding técnico
- `data-model.md`: referência de persistência
- `api-events.md`: contrato de API
- `auth.md`: spec de autenticação
- `payments.md`: spec de pagamentos
- `admin-panel.md`: spec de backoffice
- `security.md`: baseline de segurança

## Estado atual

- Eventos próprios: `/api/own-events`
- Eventos parceiros: `/api/partner-events`
- Calendário público unificado: `/api/calendar-events`
- Enum canônico de eventos próprios: `classification`
- Alias legado mantido: `/api/events`
