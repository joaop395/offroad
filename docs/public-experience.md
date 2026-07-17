# Experiência Pública

## Rotas públicas

| Rota | Função |
|---|---|
| `/` | Landing principal com Hero, Sobre, Galeria, Próximos Rolês e CTA |
| `/eventos` | Calendário mensal público com eventos próprios e parceiros |
| `/evento-beneficente/:id` | Página de cadastro de veículo para evento beneficente |
| `/atolado-do-mes` | Experiência teatral com cortinas, countdown, áudio e foto emoldurada |
| `/dicas` | Grid de dicas/vídeos do YouTube com embed em modal |
| `/prestacao-de-contas` | Lista pública de prestações de contas de eventos próprios já realizados |

## Navbar compartilhada

- A navbar é persistida entre as rotas públicas via `PublicLayout`
- Itens atuais:
  - `Sobre` → `/#sobre`
  - `Galeria` → `/#galeria`
  - `Eventos` → `/eventos`
  - `Atolado do Mês` → `/atolado-do-mes`
  - `Dicas` → `/dicas`
  - `Prestação de Contas` → `/prestacao-de-contas`
  - `Insta` → link externo
- Em rotas diferentes de `/`, a navbar fica sólida com blur e borda inferior

## Home (`/`)

### Galeria

- Seção "Nossas Aventuras" entre o Sobre e a seção de apoiadores
- Consome `GET /api/gallery` — ordenado por `order`
- Grid 2 colunas (mobile) / 3 colunas (desktop)
- Ao clicar, abre lightbox fullscreen com overlay escuro e legenda
- Se não houver imagens ou a API falhar, a seção **não renderiza**

### Apoiadores

- Seção "Quem Apoia o Rolé" entre a Galeria e os Eventos
- Consome `GET /api/sponsors` — ordenado por `order`
- Logos em grayscale com opacidade 40%; no hover: cor total + escala 110%
- Cada logo pode ter link externo (abre em nova aba)
- Se não houver patrocinadores ou a API falhar, a seção **não renderiza**

### Próximos Rolês

- Consome o feed unificado de `GET /api/calendar-events`
- Exibe eventos futuros em destaque um por vez
- Permite navegar entre cards com setas anterior/próximo
- Eventos próprios usam card completo com CTA de inscrição
- Eventos beneficentes mostram badge verde e botão "Cadastrar Veículo" ao invés de "Inscrever-se"
- Eventos parceiros entram em modo `teaser`, com resumo curto em vez de descrição completa

## Calendário (`/eventos`)

- Grade mensal com navegação por mês anterior/próximo
- Usa `GET /api/calendar-events`
- Eventos beneficentes aparecem com borda verde no calendário
- Clique em qualquer item/dia com evento abre container modal com backdrop blur
- O detalhe completo diferencia:
  - `own` (normal): inscrição, preços, vagas quando existirem
  - `own` (beneficente): logo, descrição, botão "Cadastrar Veículo" que redireciona para `/evento-beneficente/:id`
  - `partner`: conteúdo informativo, sem CTA de checkout

## Página de cadastro de veículo (`/evento-beneficente/:id`)

- Rota pública, sem necessidade de autenticação
- Busca dados do evento via `GET /api/own-events/:id`
- Valida se o evento é beneficente (`isBeneficente=true`)
- Exibe: logo do evento, nome, data, local, descrição
- Formulário de cadastro:
  - Nome do motorista (obrigatório, max 120)
  - CPF (obrigatório, formato XXX.XXX.XXX-XX, com máscara automática)
  - Placa do veículo (obrigatório, formato ABC-1234, com formatação automática)
  - Vagas disponíveis (obrigatório, 1-50)
- Validação no backend:
  - CPF único por evento (409 se duplicado)
  - Formato de placa e CPF validados por regex
- Feedback visual: sucesso (verde) ou erro (vermelho)
- Link de cadastro é compartilhável via WhatsApp/redes sociais

## Atolado do Mês (`/atolado-do-mes`)

- Não depende de backend nem de tabela no banco
- Usa assets públicos estáticos:
  - `public/media/atolado-do-mes/atolado-do-mes.mp3`
  - `public/media/atolado-do-mes/atolado-do-mes.jpeg`
- Fluxo:
  - cortinas fechadas
  - botão vermelho central com texto `clique aqui para saber o atolado do mês`
  - countdown `3`, `2`, `1`
  - abertura das cortinas
  - início do MP3 no mesmo instante da revelação da foto
- A foto aparece em moldura dourada/cinematográfica, centralizada
- Não há fallback de mídia nem dependência administrativa na versão atual

## Dicas (`/dicas`)

- Consome `GET /api/tips` — retorna apenas dicas com `published: true`, ordenadas por `order`
- Grid responsivo: 1 coluna (mobile) / 2 (sm) / 3 (md) / 4 (lg)
- Cada card exibe:
  - Thumbnail do YouTube (extraída automaticamente da URL) ou imagem de capa customizada
  - Título da dica
  - Descrição truncada (line-clamp-2)
  - Botão play sobreposto no hover
- Ao clicar, abre modal com:
  - Header com título e botão fechar
  - Embed do YouTube em aspect-video (`youtube-nocookie.com`)
  - Descrição completa abaixo do vídeo
- Se não houver dicas publicadas ou a API falhar, exibe mensagem "Nenhuma dica publicada ainda. Volte em breve!"

## Prestação de Contas (`/prestacao-de-contas`)

- Consome `GET /api/calendar-events`
- Exibe somente eventos próprios (`kind: own`) já realizados
- Eventos parceiros nunca aparecem nessa página
- Eventos próprios sem `accountabilityImageUrl` ficam ocultos
- Cada item abre um container expansível com o print completo da prestação de contas
