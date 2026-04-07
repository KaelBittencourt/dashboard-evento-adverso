# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral do Projeto

Dashboard de Eventos Adversos — um painel de segurança do paciente que visualiza dados de eventos adversos a partir de exports CSV do Google Sheets. A aplicação possui 4 dashboards, cada um alimentado por uma planilha diferente.

**Stack:** Vite + React 18 + TypeScript, TailwindCSS (componentes shadcn/ui), Recharts, React Query, React Router.

## Comandos

```
pnpm dev          # Inicia servidor de desenvolvimento (vite)
pnpm build        # Build de produção
pnpm preview      # Preview do build de produção localmente
pnpm test         # Roda testes (vitest)
pnpm lint         # ESLint
```

## Arquitetura

### Padrão dos Dashboards

Cada dashboard segue a mesma arquitetura em camadas:

```
src/pages/{Dashboard}.tsx         — Componente da página (header + filtros + layout)
src/hooks/use{Model}.ts           — Hook de dados: busca CSV, parse, filtros, refresh a cada 5 min
src/lib/{model}Analytics.ts       — Análises: KPIs, geradores de dados de gráficos, insights
src/components/dashboard/{Model}Charts.tsx — Componentes de gráficos (Recharts)
```

### Fluxo de Dados

1. **Hook** busca e faz parse do CSV do Google Sheets no mount, configura refresh automático a cada 5 min
2. **Hook** aplica filtros reativos (dateStart/dateEnd + filtros específicos do domínio)
3. **Página** chama funções de analytics para derivar KPIs e dados dos gráficos a partir dos eventos filtrados
4. **Gráficos** renderizam com Recharts seguindo um estilo visual consistente

### Dashboards Existentes

| Rota | Hook | Analytics | Gráficos |
|-------|------|-----------|--------|
| `/` Eventos Adversos | `useAdverseEvents` | `analytics.ts` | `Charts.tsx` |
| `/quedas` Quedas | `useQuedas` | `fallsAnalytics.ts` | `FallsCharts.tsx` |
| `/flebite` Flebite | `useFlebite` | `phlebitisAnalytics.ts` | `PhlebitisCharts.tsx` |
| `/falhas-medicacao` Falhas de Medicação | `useFalhasMedicacao` | `medErrorAnalytics.ts` | `MedErrorCharts.tsx` |

### Adicionando um Novo Dashboard

1. Criar `src/hooks/useNewDashboard.ts` com busca CSV, parseCSV, parseDate, transformação de dados
2. Criar `src/lib/newDashboardAnalytics.ts` com KPIs, geradores de dados de gráficos, `generateNewInsights()`
3. Criar `src/components/dashboard/NewDashboardCharts.tsx` usando o padrão `ChartCard`
4. Criar `src/pages/NewDashboard.tsx` com header (DashboardSwitcher + filtros) + KPIs + gráficos + footer
5. Adicionar rota em `src/App.tsx`
6. Adicionar entrada em `src/components/dashboard/DashboardSwitcher.tsx`

## Parse de Datas do CSV

Datas do CSV estão no formato brasileiro: `DD/MM/YYYY HH:MM:SS`. A função `parseDate()` em cada hook lida com isso. Inputs de filtro usam `YYYY-MM-DD` (padrão HTML date).

## Filtros de Dados

Todos os dashboards definem `dateStart` padrão como `${new Date().getFullYear()}-01-01`. O `clearFilters` deve usar o mesmo valor calculado.

## Componentes UI

- `src/components/ui/` — componentes shadcn/ui (gerados automaticamente, raramente precisam de alteração)
- `src/components/dashboard/` — componentes compartilhados dos dashboards (KpiCard, DashboardHeader, DashboardSwitcher, InsightsPanel, RawDataTable, PerformanceTable)
- Padrão de padding do layout: `px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem]` (aplica-se a headers, conteúdo principal, footers)

## Testes

Usa Vitest com JS-DOM e `@testing-library/react`. Arquivos de teste ficam em `src/test/`. Configuração no `vite.config.ts`.
