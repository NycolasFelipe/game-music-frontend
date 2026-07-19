# AGENTS.md

Guia de arquitetura e convenções para agentes (e humanos) que trabalham neste
repositório. **Leia antes de escrever código.** As regras aqui têm precedência
sobre hábitos padrão.

## 1. O que é este projeto

Frontend do **game-music**, um jogo de gerenciamento de banda. É uma SPA em
**React + TypeScript (Vite)** que consome a API REST do backend
(`game-music-backend`). O repositório é um **rebuild do zero**: o antigo
`game-music` serve apenas como **referência de domínio/regras** e é
**somente leitura** — nunca o modifique.

Dois repositórios relacionados:
- **`game-music`** — protótipo original (Zustand local, sem backend). **Somente
  leitura**, base de regras/dados. Não é para ser modificado nem importado.
- **`game-music-backend`** — a **fonte da verdade da API** (NestJS). Os módulos
  do backend (auth, bands, band-members, relationships, events, turns, fama) são
  os _bounded contexts_ que as `features/` deste frontend espelham.

## 2. Stack

| Camada | Escolha |
|--------|---------|
| Build/dev | **Vite** |
| Linguagem | **TypeScript** (strict) |
| UI kit | **Mantine** (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`) |
| Ícones | `@tabler/icons-react` |
| Estado de **servidor** | **TanStack Query** (`@tanstack/react-query`) |
| Estado de **UI/cliente** | **Zustand** |
| Roteamento | **React Router** |
| Gráficos | **Recharts** |
| Testes | **Vitest** + **React Testing Library** |
| Lint | **ESLint** (typescript-eslint) |

> Regra de ouro (do artigo-base): **estado de servidor é separado de estado de
> UI.** Dados vindos da API vivem no TanStack Query; Zustand guarda **apenas**
> estado de cliente/UI. Nunca duplique dados do servidor dentro do Zustand.

## 3. Estrutura de diretórios

Organização **por feature (domínio)**, não por tipo. Adaptada da proposta de
arquitetura de referência.

```
src/
├─ main.tsx              # entry: providers (QueryClientProvider, RouterProvider,
│                        #   MantineProvider, Notifications)
├─ App.tsx              # shell da aplicação
├─ components/           # UI compartilhada e AGNÓSTICA de domínio
│                        #   (Card, PageShell, ConfirmModal, StatBadge…)
├─ features/            # um módulo por domínio (espelha o backend)
│   ├─ auth/
│   │   ├─ components/   # UI específica da feature (LoginForm…)
│   │   ├─ hooks/        # useLogin(), useCurrentUser()
│   │   ├─ services/     # auth.api.ts (chamadas HTTP + queryFn/mutationFn)
│   │   ├─ store/        # authStore.ts (token) — estado de CLIENTE
│   │   └─ types.ts      # tipos da feature (DTOs da API do auth)
│   ├─ bands/            # bandas + relacionamentos + fama (leitura)
│   ├─ band-members/     # membros/personagens
│   ├─ events/           # eventos ativos (decisão) + passivos (timeline)
│   └─ turns/            # avanço de turno (relógio do jogo)
├─ hooks/               # hooks globais reutilizáveis, sem domínio
├─ services/            # cliente HTTP base + config (http.ts, queryClient.ts)
├─ store/               # stores globais de UI (ex.: bandaSelecionada, tema)
├─ pages/               # views por rota; COMPÕEM features, sem lógica de dados pesada
├─ routes/              # definição de rotas + guards (RequireAuth)
├─ lib/                 # wrappers/configuração de libs (theme do Mantine…)
├─ types/               # tipos globais compartilhados entre features
└─ utils/               # funções puras auxiliares (formatação, etc.)
```

## 4. Camadas e regra de dependência

Fluxo de dependência **unidirecional** (de cima para baixo). Uma camada só pode
importar de camadas abaixo dela:

```
pages/  →  features/  →  { components/, services/, hooks/, store/, lib/, utils/, types/ }
```

Regras:
- **`pages/` orquestra, não implementa.** Uma página monta layout e compõe
  componentes de feature. Regras de dados/estado ficam nas features.
- **Uma feature NÃO importa de outra feature** diretamente. Se duas features
  precisam se comunicar, use: (a) store global de UI (`store/`), (b) o cache do
  TanStack Query (chave compartilhada), ou (c) composição na `page/`.
- **Só `services/` (e `features/*/services/`) falam HTTP.** Componentes e páginas
  nunca chamam `fetch` diretamente — sempre via hook de query/mutation.
- **`components/` é agnóstica de domínio.** Nada de "BandCard" em `components/`;
  isso é `features/bands/components/`. Em `components/` só entra o que qualquer
  feature poderia reutilizar.
- **Dados fluem para baixo (props), eventos sobem (callbacks).**

## 5. Anatomia de uma feature

Cada feature é auto-contida e espelha um bounded context do backend:

```
features/<dominio>/
├─ components/   # componentes de UI da feature (apresentacionais + container)
├─ hooks/        # hooks que expõem dados/ações (useBands, useAdvanceTurn…)
├─ services/     # <dominio>.api.ts — funções que chamam a API e as query/mutation fns
├─ store/        # (opcional) Zustand APENAS para estado de UI da feature
├─ types.ts      # tipos/DTOs da feature
└─ index.ts      # API pública da feature (re-exports); o resto é privado
```

Mapa feature ↔ backend:

| Feature | Endpoints backend (base) |
|---------|--------------------------|
| `auth` | `POST /auth/login` → `{ accessToken }` (Bearer JWT) |
| `bands` | `GET/POST /bands`, `GET/DELETE /bands/:id`, `GET /bands/generate-name`, `GET /bands/:id/fame`, `GET/PATCH /bands/:id/relationships` |
| `band-members` | membros compostos em `GET /bands/:id` |
| `events` | `POST/GET /bands/:id/events`, `POST /bands/:id/events/:eventId/resolve`, `POST/GET /bands/:id/passive-events` |
| `turns` | `POST /bands/:id/turns/advance`, `GET /bands/:id/turns` |

> **Fama** é valor **derivado** (nível 0–30 a partir de `fanCount`): já vem
> embutida em cada resposta de banda e há `GET /bands/:id/fame`. No frontend é
> preocupação **apresentacional** dentro de `bands` — não crie estado próprio
> para ela.

## 6. Estado: servidor vs UI

**Servidor (TanStack Query)** — tudo que vem da API:
- Chamadas em `features/*/services/<dominio>.api.ts`.
- Hooks `useQuery`/`useMutation` em `features/*/hooks/`.
- Padronize as **query keys** (ex.: `["bands"]`, `["bands", id]`,
  `["bands", id, "turns"]`). Invalide-as nas mutations (ex.: resolver evento →
  invalidar `["bands", id]` e `["bands", id, "events"]`).
- Estados de loading/erro/refetch vêm da query — não recrie no Zustand.

**Cliente (Zustand)** — só estado local de UI:
- Token de auth (`authStore`), banda selecionada, tema, modais/painéis abertos,
  rascunhos de formulário. Nada que a API seja dona.

## 7. Camada de serviços (cliente HTTP)

- `services/http.ts`: um cliente base (wrapper de `fetch`) que injeta a
  `baseURL` (via `import.meta.env.VITE_API_URL`), o header `Authorization:
  Bearer <token>` (lido do `authStore`), serializa JSON e **normaliza erros** da
  API num tipo `ApiError` (status + mensagem).
- `services/queryClient.ts`: instância do `QueryClient` (defaults de retry,
  staleTime).
- Cada feature tem `services/<dominio>.api.ts` com funções finas por endpoint.
- Trate `401` de forma central (limpar token + redirecionar para login).

## 8. Componentes: apresentacional vs container

- **Apresentacional**: recebe tudo por props, sem data-fetching, sem store.
  Fácil de testar e reusar.
- **Container**: usa hooks (query/mutation/store) e passa dados para os
  apresentacionais. Mantém a lógica na borda da feature.
- Prefira componentes pequenos; use Mantine em vez de CSS manual sempre que der.

## 9. Roteamento

- Rotas em `routes/`; views em `pages/` (ex.: `LoginPage`, `BandsPage`,
  `BandDashboardPage`).
- `RequireAuth` guarda rotas privadas (sem token → redireciona a `/login`).
- URL é fonte de navegação: use params (`/bands/:bandId`) em vez de guardar a
  tela atual em estado global.

## 10. Convenções

- **Path alias `@/` → `src/`** em TODOS os contextos (Vite, tsconfig, Vitest).
  Nada de `../../../`. Ex.: `import { useBands } from "@/features/bands"`.
- Importe features pela sua API pública (`@/features/bands`), não por caminhos
  internos.
- Arquivos: componentes `PascalCase.tsx`; hooks `useAlgo.ts`; serviços
  `<dominio>.api.ts`; stores `<nome>Store.ts`; testes `*.test.ts(x)`
  co-localizados.
- Nomes de domínio seguem o backend (`fanCount`, `currentYear`, `foundationYear`,
  `happiness`, `relationshipLevel`…). Não renomeie campos da API.
- Escreva código no idioma do código ao redor; comentários e ADRs em PT-BR.

## 11. Qualidade — porta obrigatória

Antes de concluir qualquer tarefa, rode e **deixe verde**:

```bash
npm run check   # = tsc --noEmit  &&  eslint  &&  vitest run
```

- `typecheck`: `tsc --noEmit` (o build NÃO substitui isto).
- `lint`: ESLint com regras type-aware.
- `test`: Vitest + React Testing Library. Teste **hooks e lógica** de feature e
  **comportamento** de componentes (não detalhes de implementação). Mocke a
  camada `services/`.
- Nunca finalize com `check` quebrado. Se algo falhar, conserte ou explique.

## 12. ADRs

Decisões de arquitetura relevantes vão em `docs/adr/NNNN-titulo.md` (mesmo
formato do backend: Contexto, Decisão, Consequências; Status `Aceita`). Registre
uma ADR ao introduzir/alterar uma decisão estrutural (lib de estado, padrão de
data-fetching, estratégia de erro, etc.). ADR aceita é imutável — para reverter,
crie outra que a substitua.

## 13. Regras invioláveis

1. **Não modifique `game-music`** (referência somente leitura) nem
   `game-music-backend` a partir daqui.
2. **Estado de servidor ≠ estado de UI** — dados da API só via TanStack Query.
3. **Só `services/` fala HTTP.**
4. **Features não se importam entre si.**
5. **`npm run check` verde** antes de concluir.
6. **Nunca commite segredos**; config sensível via `VITE_*` em `.env` (com
   `.env.example` versionado).

## 14. Fluxo para adicionar uma feature/endpoint

1. Modele os tipos em `features/<dominio>/types.ts` a partir do DTO do backend.
2. Adicione a função HTTP em `features/<dominio>/services/<dominio>.api.ts`.
3. Exponha via hook (`useQuery`/`useMutation`) em `features/<dominio>/hooks/`,
   com query key padronizada e invalidações nas mutations.
4. Construa os componentes (apresentacional + container) em
   `features/<dominio>/components/`.
5. Componha na `page/` e ligue a rota em `routes/`.
6. Escreva testes (hook + componente). Rode `npm run check`.
7. Se mudou uma decisão estrutural, escreva a ADR.
