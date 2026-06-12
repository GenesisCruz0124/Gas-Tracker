# Gas Tracker — Project Plan

A simple app to track personal gas (fuel) expenses: log every fill-up, see how much
you're spending, and learn your real cost per mile.

## 1. Goals

- Log a fill-up in under 15 seconds (date, odometer, gallons, total cost).
- See monthly/yearly spending at a glance.
- Track fuel efficiency (MPG) and cost per mile over time.
- Work well on a phone, since fill-ups happen at the pump.

## 2. Recommended Tech Stack

A mobile-friendly **web app** keeps things simple and works on any device:

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + TypeScript | Fast to build, easy to deploy |
| Styling | Tailwind CSS | Quick, clean mobile-first UI |
| Storage (MVP) | Browser `localStorage` / IndexedDB | No backend needed to start; data stays on device |
| Charts | Recharts | Simple spending/MPG charts |
| Backend (later) | Supabase or Express + SQLite | Add when you want sync across devices |

Starting backend-free means the MVP is just a static site you can deploy to
GitHub Pages, Netlify, or Vercel for free.

## 3. Data Model

```ts
interface FillUp {
  id: string;          // uuid
  date: string;        // ISO date
  odometer: number;    // miles at fill-up
  gallons: number;
  pricePerGallon: number;
  totalCost: number;   // gallons * pricePerGallon (editable)
  station?: string;    // optional, e.g. "Shell on Main St"
  isFullTank: boolean; // needed for accurate MPG calc
  notes?: string;
  vehicleId: string;
}

interface Vehicle {
  id: string;
  name: string;        // "My Civic"
  make?: string;
  model?: string;
  year?: number;
}
```

Derived values (computed, not stored):
- **MPG** = miles since last full tank ÷ gallons
- **Cost per mile** = total cost ÷ miles driven
- **Monthly spend** = sum of `totalCost` grouped by month

## 4. Screens

1. **Dashboard (home)** — this month's spend, average MPG, cost per mile,
   spending trend chart, and a big "Add Fill-Up" button.
2. **Add Fill-Up** — quick form; auto-calculates total from gallons × price
   (or price from total), remembers last odometer to catch typos.
3. **History** — list of all fill-ups, tap to edit/delete, filter by month or vehicle.
4. **Stats** — MPG over time, price-per-gallon trend, monthly spend bar chart.
5. **Settings** — manage vehicles, units (miles/km, gallons/liters),
   export/import data as CSV or JSON.

## 5. Milestones

### Milestone 1 — MVP (core tracking)
- [ ] Project scaffold (Vite + React + TS + Tailwind)
- [ ] Add/edit/delete fill-ups, persisted to localStorage
- [ ] History list
- [ ] Dashboard with monthly total and average MPG

### Milestone 2 — Insights
- [ ] Stats screen with charts (spend per month, MPG trend, gas price trend)
- [ ] Cost-per-mile calculation
- [ ] Data export/import (CSV/JSON) so data is never locked in

### Milestone 3 — Polish & power features
- [ ] Multiple vehicles
- [ ] Unit settings (km/liters support)
- [ ] PWA setup (installable on phone, works offline)
- [ ] Optional: cloud sync with Supabase + login

## 6. Nice-to-Haves (someday)

- Reminders ("you usually fill up every 9 days")
- Gas price comparison vs. local average
- Receipt photo attachment
- Budget alerts ("you've spent $180 of your $200 gas budget")
