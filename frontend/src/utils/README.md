# Halleyx Custom Dashboard Builder
## Hackathon Challenge II — 2026

---

## Project Structure

```
halleyx/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   └── server.js
│   └── package.json
└── frontend/         # React + TypeScript UI
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.tsx
    │   ├── index.tsx
    │   ├── components/
    │   │   ├── CustomerOrders.tsx   ← Main orders page
    │   │   ├── OrderForm.tsx        ← Create/Edit popup form
    │   │   └── ContextMenu.tsx      ← Right-click menu + delete confirm
    │   ├── hooks/
    │   │   └── useOrders.ts         ← Data fetching hook
    │   ├── types/
    │   │   └── index.ts             ← All TypeScript types
    │   └── utils/
    │       ├── api.ts               ← API service layer
    │       └── constants.ts         ← Dropdowns, colors, options
    ├── package.json
    └── tsconfig.json
```

---

## Getting Started

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev       # or: npm start
# API running at http://localhost:4000
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders | List all orders (supports ?dateRange=7d) |
| GET | /api/orders/:id | Get single order |
| POST | /api/orders | Create order |
| PUT | /api/orders/:id | Update order |
| DELETE | /api/orders/:id | Delete order |
| GET | /api/orders/stats/summary | Aggregated stats for dashboard |

---

## Features Built (Module 1 — Customer Orders)

- ✅ Create Order popup form with all fields
- ✅ Full mandatory field validation ("Please fill the field")
- ✅ Auto-calculated Total Amount (Quantity × Unit Price)
- ✅ Edit order via context menu
- ✅ Delete with confirmation dialog
- ✅ Right-click context menu OR ⋯ button
- ✅ Status badges (Pending / In progress / Completed)
- ✅ Search/filter across all fields
- ✅ Toast notifications
- ✅ Empty state with CTA
- ✅ REST API with full CRUD

---

## Next Up — Module 2: Dashboard Builder

- Drag-and-drop canvas (react-grid-layout)
- 7 widget types: Bar, Line, Pie, Area, Scatter, Table, KPI
- Widget config side panel
- Responsive 12/8/4 column grid
- Real-time data from Customer Orders
