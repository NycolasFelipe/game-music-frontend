# 0001 — Central de decisões (modal único para tudo que segura o turno)

- **Status:** Aceita
- **Data:** 2026-07-26
- **Decisores:** Equipe de frontend
- **Relacionada:** backend [0009 — Eventos](../../../game-music-backend/docs/adr/0009-eventos.md),
  backend [0015 — Tempo de produção](../../../game-music-backend/docs/adr/0015-tempo-de-producao-e-saturacao.md)

## Contexto

O jogo passou a ter dois tipos de decisão que **impedem o turno de avançar**:

1. **Eventos da banda** (ativos) — apareciam como um card na aba *Visão geral*.
2. **Sessões de estúdio** da obra em produção — apareciam dentro do modal de
   criação de obra, acessível só pela aba *Discografia*.

O backend bloqueia o tick nos dois casos, mas a interface espalhava a resposta
por abas diferentes. Na prática o jogador clicava "Avançar turno", tomava um
erro, e tinha que sair caçando qual aba escondia a pendência — pior ainda depois
do ADR-0015 do backend, quando as sessões passaram a pingar uma por turno
durante toda a gravação.

O problema não é o número de decisões: é o jogador ter que **procurar** por elas.

## Decisão

### 1. Uma fila só, em um modal só
Nasce a feature `features/decisions`. O hook `usePendingDecisions(bandId)` junta
as origens numa lista normalizada (`PendingDecision`), e o `DecisionsModal`
mostra **uma decisão por vez**, com contador quando há mais de uma. Eventos da
banda vêm antes das sessões de estúdio — o que envolve pessoas pesa mais que o
que envolve o disco — e a obra pronta vem por último.

### 2. O modal se abre sozinho
Montado no `BandDashboardPage`, fora das abas: assim a decisão alcança o jogador
onde ele estiver. Um efeito compara a *assinatura* da fila (as chaves das
decisões) e abre quando ela muda para algo não-vazio, fecha quando esvazia. Isso
evita reabrir um modal que o jogador dispensou de propósito, sem deixar uma
decisão nova passar batida.

### 3. Estado de abertura em store, não em props
`useDecisionsUi` (Zustand) guarda apenas `open`. Quem precisa chamar o modal — o
botão de turno na *Visão geral*, o rascunho na *Discografia* — está em subárvores
distantes; passar callback por props atravessaria três componentes que não têm
nada a ver com o assunto. Dados continuam no TanStack Query; a store guarda só
o que é efêmero de UI, como manda a seção 4 do AGENTS.

### 4. O botão de avançar turno vira o botão de resolver
Com pendências **bloqueantes**, "Avançar turno" dá lugar a **"Resolver N
decisões"**, que abre o modal. Um botão desabilitado dizia "não pode" sem dizer
"faça isto"; este diz.

### 5. "Pronto para lançar" também é um chamado, mas não é um bloqueio
A obra que saiu do estúdio entra na mesma fila e aparece no mesmo modal — era a
última coisa que só existia dentro de uma aba. Mas `usePendingDecisions` separa
`blocking` de `decisions`: **lançar é oportunidade, não obrigação**. Segurar o
turno até o jogador prensar o disco tiraria dele a única alavanca contra a
saturação de mercado (ADR-0015 do backend), que é justamente escolher *quando*
lançar. O card oferece "Lançar X" e "Ainda não".

### 6. O ritual de revelação é montado uma vez
Como o lançamento passou a partir de dois lugares, o `ReleaseRevealModal` saiu da
*Discografia* e virou `ReleaseRevealHost`, montado no dashboard e alimentado pela
store `useReleaseRevealUi`. Efeito colateral necessário: **a obra em revelação
some da estante** enquanto a cerimônia acontece. Com as estrelas já impressas
atrás do modal, a revelação estaria anunciando uma nota que o jogador já leu. Pelo
mesmo motivo, o toast de lançamento não cita mais qualidade nem fãs.

### 7. O modal de criação não resolve mais sessões
Criar a obra e gravá-la deixaram de ser o mesmo momento (ADR-0015 do backend): ao
entrar no estúdio, o modal de criação **fecha** com uma notificação, e as sessões
chegam depois pela central. Se o jogador abrir um rascunho que tem sessão
pendente, o modal só aponta para a central em vez de duplicar a decisão.

## Consequências

- Uma decisão tem **um** lugar. Nada de duas telas resolvendo o mesmo evento.
- `usePendingDecisions` roda em dois lugares (modal e aba de turno); o TanStack
  Query deduplica as requisições, então o custo é o de um `find` em memória.
- A central depende de haver **um rascunho por vez** — regra do backend hoje. Se
  isso mudar, o hook precisa iterar sobre todos os rascunhos.
- A jornada do modal de criação encurtou: o *stepper* ainda mostra "Estúdio" e
  "Lançamento", mas esses passos acontecem em outro momento do jogo.
- Eventos **passivos** (notícias da cena) continuam só na linha do tempo: não
  pedem resposta, e um modal por notícia só somaria cliques.
- A obra em revelação some da *Discografia* por alguns segundos. É intencional,
  mas se um dia a estante ganhar animação de entrada, os dois efeitos precisam
  ser coordenados.

## Referências
- Implementação: [src/features/decisions/](../../src/features/decisions/),
  [src/features/events/components/ActiveEventDecision.tsx](../../src/features/events/components/ActiveEventDecision.tsx),
  [src/features/releases/components/ReleaseRevealHost.tsx](../../src/features/releases/components/ReleaseRevealHost.tsx).
- Montagem: [src/pages/BandDashboardPage.tsx](../../src/pages/BandDashboardPage.tsx).
