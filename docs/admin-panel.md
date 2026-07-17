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
/evento-beneficente/:id → página pública de cadastro de veículo
```

Se tentar acessar `/offroad-admin/dashboard` sem estar logado, redireciona automaticamente para `/offroad-admin`.

## Sessão

- Access token (15 min) armazenado em `sessionStorage` — some ao fechar a aba
- Refresh token (7 dias) em cookie `httpOnly` — renova o access token automaticamente
- Ao expirar a sessão, frontend redireciona para login

## Abas do painel

### Eventos próprios

- Lista todos os eventos com classificação/badge, data, local, preços e vagas
- Eventos beneficentes mostram badge verde "Beneficente" e link de cadastro
- **Novo Evento**: abre formulário com toggle "Evento Beneficente" no topo

#### Formulário — Evento normal

- Nome, Data/hora, Local, Classificação (select com presets), Vagas máximas, Valor adulto, Valor criança
- Print da prestação de contas (upload imagem, opcional)
- Descrição (opcional)

#### Formulário — Evento beneficente

Quando o toggle "Evento Beneficente" está ativado:
- Nome, Data/hora, Local (obrigatórios)
- Descrição (obrigatório)
- Logo do evento (upload imagem, opcional)
- Classificação, preços e vagas são ocultados (definidos automaticamente como REUNIAO/0/0)
- Print da prestação de contas é ocultado

Após salvar evento beneficente, um painel verde exibe o link de inscrição:
```
Link de inscrição: https://site.com/evento-beneficente/123
[Botão Copiar Link]
```

- **Editar**: reabre o formulário preenchido (mantém o toggle correto)
- **Excluir**: confirma antes — remove evento, inscrições e veículos (CASCADE)
- **Veículos**: (beneficente) abre lista de veículos cadastrados
- **Inscritos (N)**: (normal) abre lista de inscrições do evento

### Veículos cadastrados (beneficente)

- Lista veículos com: nome do motorista, CPF, placa, vagas disponíveis
- **Exportar CSV**: gera arquivo com todos os veículos
- **Remove**: exclusão individual com confirmação

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

### Galeria

- Lista as fotos em grid com miniaturas
- **Adicionar**: upload de imagem (PNG/JPG, max 5MB) + label
- **Reordenar**: botões ↑↓ trocam a posição
- **Excluir**: remove do banco e deleta o arquivo

### Patrocinadores

- Lista os logos em grid com miniaturas
- **Adicionar**: upload de imagem + nome + link opcional
- **Reordenar**: botões ↑↓ trocam a posição
- **Excluir**: remove do banco e deleta o arquivo

### Dicas

- Lista os vídeos em grid com thumbnails (YouTube) ou imagem de capa customizada
- **Nova Dica**: abre formulário com campos:
  - Título (obrigatório, max 120)
  - Link do YouTube (obrigatório — aceita youtube.com/watch, youtu.be, shorts, embed)
  - Descrição (opcional, max 2000)
  - Imagem de capa (opcional, PNG/JPG, max 5MB)
  - Checkbox "Publicado" — desmarcado = rascunho (não aparece publicamente)
- **Editar**: reabre o formulário preenchido, com preview da imagem atual
- **Reordenar**: botões ↑↓ trocam a posição (atualiza `order` via PATCH batch)
- **Excluir**: remove do banco e deleta a imagem associada
- Badge "Rascunho" aparece nos cards não publicados

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
- Eventos beneficentes (`isBeneficente=true`) aceitam cadastro de veículos via link público
- O link de cadastro é `/evento-beneficente/:eventId` — compartilhável via WhatsApp/redes
- `Atolado do Mês` não é gerenciado pelo painel na versão atual; a página usa mídia pública estática
- Galeria, Patrocinadores e Dicas seguem o mesmo padrão de CRUD: multer + Prisma + `/uploads/` servido via `/api/uploads/`
- Dicas não publicadas (`published: false`) são visíveis apenas no admin
- A seção pública de cada recurso só renderiza se houver dados — se vazia ou backend off, some graciosamente
