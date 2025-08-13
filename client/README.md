# Explorer KPIs — Modular + RxJS (Frontend Only)
- Separate files for **components, pages, services, hooks, helpers, styles**.
- Calls **NASA APIs** from **services** (not inside components).
- Uses **RxJS** observables + a tiny `useObservable` hook.

## Quick start
npm i
npm run dev

Set `VITE_NASA_API_KEY` in a `.env` (DEMO_KEY is default and rate-limited).

## Structure
src/
  pages/ExplorerPage.tsx
  components/{Explorer,KpiCard,Sparkline}.tsx
  modules/{Apod,Mars,NeoOrbit,Eonet}.tsx
  services/{neo.service,eonet.service}.ts
  hooks/useObservable.ts
  helpers/{date,number,neo}.ts
  styles/{base.css,kpis.css}
  lib/api.ts
