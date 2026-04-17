# Painel Admin

## Acesso

- URL: `/offroad-admin`
- Rota **não linkada** no nav público e **bloqueada** em `robots.txt`
- Login com e-mail + senha definidos no seed (`.env`)

## Fluxo de navegação

```
/offroad-admin          → tela de login
/offroad-admin/dashboard → painel (requer auth)
/inscricao/sucesso      → retorno de pagamento aprovado
/inscricao/pendente     → retorno de pagamento pendente
/inscricao/erro         → retorno de pagamento não aprovado
```

Se tentar acessar `/offroad-admin/dashboard` sem estar logado, redireciona automaticamente para `/offroad-admin`.

## Sessão

- Access token (15 min) armazenado em `sessionStorage` — some ao fechar a aba
- Refresh token (7 dias) em cookie `httpOnly` — renova o access token automaticamente
- Ao expirar a sessão, frontend redireciona para login

## Abas do painel

### Eventos próprios

- Lista todos os eventos com classificação, data, local, preços e vagas
- **Novo Evento**: abre formulário com campos:
  - Nome, Data/hora, Local, Classificação (select com presets), Vagas máximas obrigatórias, Valor adulto, Valor criança
- **Editar**: reabre o formulário preenchido
- **Excluir**: confirma antes — remove evento e todas as inscrições (CASCADE)
- **Inscritos (N)**: abre lista de inscrições do evento

### Eventos parceiros

- Lista todos os eventos parceiros com data, resumo do texto e indicador de banner
- **Novo Parceiro**: abre formulário com campos:
  - Nome, Data/hora, Texto obrigatório, Local opcional, Banner opcional
- **Editar**: reabre o formulário preenchido, com preview do banner atual
- **Excluir**: remove o registro e o banner associado, se existir
- Parceiros **não** exibem botão de inscritos e **não** participam do checkout

### Inscritos por evento

- Tabela com: nome, telefone, e-mail, adultos, crianças, total pago, data do pagamento, ID MP
- Botão **Exportar CSV** gera arquivo para download

### Configurações

- Campo: **Número WhatsApp do admin** (formato: `5511999990000`)
- Usado para montar o link `wa.me` apenas na página de sucesso pós-pagamento

## Presets de classificação

| Valor interno | Label exibido | Cor |
|---|---|---|
| LEVE_4X4 | Leve 4x4 | Verde #27AE60 |
| LEVE_AT_4X4 | Leve · Pneu AT | Verde claro #2ECC71 |
| MODERADA_AT | Moderada · Pneu AT | Laranja #D4682A |
| MODERADA_MUD | Moderada · Pneu Mud | Laranja escuro #E67E22 |
| AVANCADA | Avançada · Lift | Vermelho #C0392B |
| REUNIAO | Reunião | Azul #4C6A92 |

## Regras de domínio

- Eventos próprios usam a rota canônica `/api/own-events`
- Eventos parceiros usam `/api/partner-events`
- O calendário público mistura os dois tipos via `/api/calendar-events`
- Somente eventos próprios aceitam inscrições e pagamentos pelo site
- `Atolado do Mês` não é gerenciado pelo painel na versão atual; a página usa mídia pública estática
