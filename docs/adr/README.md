# Architecture Decision Records (ADRs) — frontend

Este diretório registra as decisões de arquitetura relevantes do frontend usando
o formato [ADR](https://adr.github.io/), o mesmo do backend.

Cada ADR é imutável depois de aceita: para reverter ou alterar uma decisão, crie
uma nova ADR que a substitua (`Supersedes`/`Superseded by`).

## Convenções
- Arquivo: `NNNN-titulo-em-kebab-case.md` (numeração sequencial, começando em `0001`).
- Status: `Proposta` → `Aceita` → (`Substituída` | `Depreciada`).
- Estrutura mínima: Contexto, Decisão, Consequências.
- A numeração é independente da do backend; quando uma decisão daqui depende de
  uma de lá, referencie pelo caminho relativo.

## Índice
| # | Título | Status |
|---|--------|--------|
| [0001](0001-central-de-decisoes.md) | Central de decisões (modal único para tudo que segura o turno) | Aceita |
