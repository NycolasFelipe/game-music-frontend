# 0002 — Identidade visual "revista" e aba Turno

- **Status:** Aceita
- **Data:** 2026-11-09
- **Decisores:** Dono do jogo + equipe de frontend
- **Relacionada:** backend [0022 — Painel do turno](../../../game-music-backend/docs/adr/0022-painel-do-turno.md),
  backend [0023 — Aparência dos integrantes e cenário da banda](../../../game-music-backend/docs/adr/0023-aparencia-dos-integrantes-e-cenario-da-banda.md),
  [0001 — Central de decisões](0001-central-de-decisoes.md)

## Contexto

Dois problemas apareceram jogando:

1. **Ações do turno espalhadas.** Para jogar um turno o jogador ia à *Agenda*
   (show e convívio), à *Discografia* (obra) e à *Visão geral* (avançar). Trocar
   de aba toda hora quebrava o ritmo.
2. **Cara de painel de empresa.** O layout padrão do Mantine, com cards, badges
   coloridos e emojis, foi descrito pelo dono como "SaaS de empresa". Uma versão
   neon com emojis foi descartada por ser "infantil e genérica".

Foram prototipadas quatro direções em HTML estático. O dono escolheu **revista**:
cada turno é uma edição, a banda é a matéria de capa, os modais são encartes.

## Decisão

### 1. Identidade visual de revista impressa, só no tema claro
- Papel (`#f2ede3`), tinta (`#131211`) e um único vermelho de destaque
  (`#d4241b`). Sem outras cores de marca e sem emojis na interface.
- Tipografia: Playfair Display (títulos), Libre Franklin (texto) e IBM Plex Mono
  (números, legendas e rótulos), carregadas do Google Fonts.
- Cantos retos, fios de 1 px e 4 px como separadores, sombras chapadas.
- O esquema escuro sai: a revista é papel. O `ColorSchemeToggle` foi removido e
  o `MantineProvider` força o tema claro.
- A troca é feita **no tema do Mantine** (`lib/theme.ts`) e numa folha de estilo
  global (`styles/revista.css`), para que os componentes existentes herdem a
  identidade sem reescrita. Componentes de layout editorial reutilizáveis
  (chamada, manchete, linha fina, ficha de números, livro-caixa) ficam em
  `components/revista/`.

### 2. Fotos em retícula desenhadas em SVG
- Cada integrante tem um retrato e a banda tem uma foto de grupo, desenhados em
  SVG com padrões de pontos, como foto de jornal. Não há imagens externas.
- **As fotos são em preto e branco.** O vermelho fica fora delas.
- Tom de pele e cabelo (cor e cacho) vêm do `avatar` emoji. Penteado, barba,
  óculos, brinco e roupa vêm de `member.appearance`, e o cenário da foto vem de
  `band.photoScene`, os dois guardados no backend (ADR-0023 do backend). Quando
  o campo não vier, o frontend sorteia a partir do id, para continuar
  funcionando com respostas antigas.
- A expressão do rosto segue o humor do integrante.
- Os padrões de retícula são definidos uma vez (`HalftoneDefs`) e referenciados
  por id em todos os SVGs.

### 3. Discos como vinil desenhado
O disco de cada obra segue a estante anterior (`VinylRecord`): o acabamento vem
da faixa de qualidade (fracasso liso, medíocre com aro escuro, sólido com aro
claro, grande vermelho, obra-prima duplo no estojo) e o rótulo é sorteado pelo
id da obra.

### 4. Aba Turno e seções como páginas da revista
- A navegação da banda vira o índice da revista, com a seção na URL
  (`/bands/:bandId/:section`): **Turno**, Elenco, Discografia, Números, Arquivo,
  Ex-integrantes e Expediente.
- **Turno** substitui *Visão geral* e *Agenda*. Numa tela só: a capa (foto da
  banda e matéria do momento), as pendências, as três colunas de ação (Palco,
  Convívio e Estúdio) e o fechamento com a previsão do caixa e o botão de
  avançar.
- Pendências e previsão vêm do `GET /bands/:id/turns/panel` (ADR-0022 do
  backend), para o número mostrado ser o que o avanço vai fazer.
- A linha do tempo vai para **Arquivo**. *Integrantes* vira **Elenco**,
  *Estatísticas* vira **Números** e *Opções* vira **Expediente**.
- A central de decisões (ADR-0001) continua sendo o lugar onde se resolve uma
  pendência; a aba Turno só lista e abre.

## Consequências

- O jogador faz o turno inteiro sem trocar de aba.
- Qualquer componente novo do Mantine herda a identidade pelo tema; cores do
  Mantine como `teal`, `grape` ou `orange` passam a ser evitadas na interface.
- O tema escuro deixa de existir. Se voltar, precisa de uma ADR nova com uma
  versão "papel escuro" da revista.
- O frontend passa a depender de dois campos novos do backend (`appearance` e
  `photoScene`), com fallback local enquanto não vierem.
