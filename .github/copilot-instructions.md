## Repo overview

This repository is a small React + Vite frontend that displays candlestick charts and a minimal FastAPI backend that provides OHLCV data for Indian tickers (appends `.NS`). The key idea: the frontend requests pre-built candle data from the backend and renders it with `lightweight-charts`.

Key paths
- Frontend entry: src/main.jsx
- UI shell: src/App.jsx
- Chart renderer: src/StockChart.jsx (uses `lightweight-charts` and fetches API data)
- Controls: src/Sidebar.jsx and src/PropertiesBar.jsx
- Backend FastAPI: vedl-backend/main.py

Big picture & data flow
- User updates ticker/count/interval in the sidebar -> App updates `chartParams` -> `StockChart` fetches `http://localhost:8000/api/stock/{ticker}/{count}/{interval}` -> backend returns JSON { data: [ {time, open, high, low, close, volume}, ... ] } -> frontend adds series to the chart and derives support/resistance/currentPrice.
- Time values are Unix timestamps (seconds) produced by the Python backend (`int(index.timestamp())`). Chart code expects numeric `time` values.

Integration notes & conventions
- Backend uses Python `yfinance` (FastAPI app in `vedl-backend/main.py`). There is no requirements file; required Python packages discovered from imports: `fastapi`, `uvicorn` (to run), `yfinance`, and `python-dateutil`/`pandas` transitively.
- Frontend `package.json` contains `yahoo-finance2` (JS) but the codebase currently uses Python `yfinance`. Be careful when changing data providers — both exist but are in different languages.
- CORS is explicitly enabled for `http://localhost:5173` in `vedl-backend/main.py`. The frontend dev server (Vite) runs on port 5173 by default; the backend is expected on port 8000.

Run & debug (concrete commands)
- Install frontend deps and run dev server:

  npm install
  npm run dev

- Start backend (typical):

  # create a venv, install packages, then run uvicorn
  python -m venv .venv
  source .venv/bin/activate
  pip install fastapi yfinance uvicorn
  uvicorn vedl-backend.main:app --reload --port 8000

- Quick API check (curl):

  curl http://localhost:8000/api/stock/VEDL/10/1m

Notes about endpoints (discoverable from vedl-backend/main.py)
- GET /api/stock/{ticker} -> returns last 10 candles (defaults: interval=1m, period=1d)
- GET /api/stock/{ticker}/{count} -> returns `count` 1m candles from last day
- GET /api/stock/{ticker}/{count}/{interval} -> returns `count` candles at specified `interval`

Frontend expectations and small pitfalls
- `StockChart.jsx` sets fixed chart `width: 800, height: 400`; this is a simple layout choice. You can replace with responsive sizing if required.
- EMA calculation is implemented inline (9 and 20 periods). The EMA function expects at least `period` number of points; adding guards for small datasets may be necessary.
- The frontend calculates support/resistance by taking min/max of lows/highs. These are plotted as horizontal line series.
- The fetch URL in `StockChart.jsx` uses port 8000; if you run the backend on a different port, update that URL or use an environment proxy.

Coding style & patterns
- Components are plain React function components (no TypeScript runtime). Keep changes minimal and local; state flows top-down (App -> StockChart, Sidebar -> App).
- Linting: `npm run lint` runs ESLint (see `eslint.config.js`).

When to modify backend vs frontend
- If the data shape (fields, time unit, ordering) needs to change, update the backend and keep the same endpoint shape or provide a compatibility route. Frontend expects an array of candles in chronological order.
- If you need faster updates or websockets, extend FastAPI (or add a small websocket endpoint) and adapt `StockChart.jsx` to stream updates into series.

If you are an AI agent working on this repo
- Prefer small, scoped changes; include both frontend and backend edits when they cross the API boundary (e.g., change to timestamp units or field names).
- Reference these files when making edits: [src/StockChart.jsx](src/StockChart.jsx#L1-L200), [vedl-backend/main.py](vedl-backend/main.py#L1-L200), [src/Sidebar.jsx](src/Sidebar.jsx#L1-L200), [package.json](package.json#L1-L50).
- Mention to the user any new runtime dependency you add (npm or pip), and include quick run steps shown above.

Next step
- Ask for clarification if you want the project to use a single data provider (JS `yahoo-finance2` vs Python `yfinance`) or to add a `requirements.txt` / `pyproject.toml` for the backend.

Please review and tell me which areas need more detail (running tests, CI, or deployment notes).
