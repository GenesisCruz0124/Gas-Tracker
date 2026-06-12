# ⛽ Gas Tracker

A mobile-first web app for tracking gas expenses. Log every fill-up and see
your monthly spending, fuel economy (MPG or L/100km), and real cost per mile.

All data lives in your browser's localStorage — no account, no backend, no
tracking. Export to CSV/JSON anytime from Settings.

## Features

- **Quick fill-up logging** — date, odometer, gallons, price; the total
  auto-calculates as you type, and odometer typos are caught against your
  last reading.
- **Dashboard** — this month's spend, average fuel economy, cost per mile.
- **History** — every fill-up, with edit and delete.
- **Stats** — charts for monthly spending, fuel economy trend, and gas price
  trend.
- **Multiple vehicles** — track each car separately and switch from the header.
- **Units** — miles/kilometers and gallons/liters; metric users get L/100km.
- **Import/export** — CSV and JSON, per vehicle.
- **PWA** — installable on your phone's home screen and works offline.

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

Built with React, TypeScript, Vite, Tailwind CSS, and Recharts.

## Deploying

**Live app:** https://genesiscruz0124.github.io/Gas-Tracker/

Every push runs the [deploy workflow](.github/workflows/deploy.yml), which
builds the app and publishes `dist/` to the `gh-pages` branch.

One-time setup (repo admin): in **Settings → Pages**, set Source to
**Deploy from a branch** and pick `gh-pages` / `/ (root)`.

`npm run build` also works with any other static host (Vercel, Netlify).
See [PLAN.md](PLAN.md) for the roadmap.
