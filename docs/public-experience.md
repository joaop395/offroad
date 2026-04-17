# Experiência Pública

## Rotas públicas

| Rota | Função |
|---|---|
| `/` | Landing principal com Hero, Sobre, Galeria, Próximos Rolês e CTA |
| `/eventos` | Calendário mensal público com eventos próprios e parceiros |
| `/atolado-do-mes` | Experiência teatral com cortinas, countdown, áudio e foto emoldurada |

## Navbar compartilhada

- A navbar é persistida entre as rotas públicas via `PublicLayout`
- Itens atuais:
  - `Sobre` → `/#sobre`
  - `Galeria` → `/#galeria`
  - `Eventos` → `/eventos`
  - `Atolado do Mês` → `/atolado-do-mes`
  - `Insta` → link externo
- Em rotas diferentes de `/`, a navbar fica sólida com blur e borda inferior

## Home (`/`)

### Próximos Rolês

- Consome o feed unificado de `GET /api/calendar-events`
- Exibe eventos futuros em destaque um por vez
- Permite navegar entre cards com setas anterior/próximo
- Eventos próprios usam card completo com CTA de inscrição
- Eventos parceiros entram em modo `teaser`, com resumo curto em vez de descrição completa

## Calendário (`/eventos`)

- Grade mensal com navegação por mês anterior/próximo
- Usa `GET /api/calendar-events`
- Clique em qualquer item/dia com evento abre container modal com backdrop blur
- O detalhe completo diferencia:
  - `own`: inscrição, preços, vagas quando existirem
  - `partner`: conteúdo informativo, sem CTA de checkout

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
