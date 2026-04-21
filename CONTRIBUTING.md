# Contributing to The Risk Factor

Thanks for your interest! This project is a portfolio/demo application.

## Running Locally

```bash
git clone https://github.com/Imohammedareeb/the-risk-factor.git
cd the-risk-factor
npm install
npm run dev:all   # starts both Vite (5173) and json-server (3001)
```

## Project Structure

All source code is in `src/`. Key folders:
- `src/components/sections/` — one file per page/route
- `src/components/ui/` — reusable UI primitives
- `src/context/` — React context (Auth, Theme, Toast)
- `src/data/` — risk engine + API service layer
- `cypress/e2e/` — end-to-end tests

## Running Tests

```bash
npm run test:open   # opens Cypress UI
npm test            # headless run
```

Requires the dev server (`npm run dev:all`) to be running first.
