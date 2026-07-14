# AI-Powered Debt Relief & Financial Recovery Platform

Full-stack app: **FastAPI + SQLite + SQLAlchemy** backend, **React (Vite)** frontend,
**Google Gemini API** for AI-generated negotiation letters, and a rule-based
financial analysis engine for settlement recommendations and debt stress scoring.

Covers all three scenarios:
1. **AI-Powered Settlement Recommendation** — add loan details, get debt stress
   analysis + a recommended settlement amount.
2. **Intelligent Negotiation Letter Generation** — Gemini-generated, lender-specific
   settlement letters / negotiation emails, with a template fallback if no API key
   is set (so it always works).
3. **Financial Health Tracking & Loan Analysis** — dashboard with EMI ratio,
   monthly surplus, debt stress level, and negotiation history.

---

## Project structure

```
debt-relief-platform/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # SQLAlchemy engine/session
│   ├── models.py                # Loan, NegotiationHistory ORM models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── requirements.txt
│   ├── .env.example              # copy to .env and add your Gemini key
│   ├── routers/
│   │   ├── loans.py             # /loans endpoints
│   │   ├── negotiation.py       # /negotiation endpoints
│   │   └── dashboard.py         # /dashboard endpoints
│   └── services/
│       ├── financial_analysis.py  # rule-based debt stress / settlement engine
│       └── gemini_service.py       # Gemini API integration + fallback templates
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js               # fetch wrapper for the backend API
        ├── index.css             # design system (ink/ledger theme)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── LoanCard.jsx
        │   ├── StatCard.jsx
        │   └── StressGauge.jsx   # signature circular debt-stress dial
        └── pages/
            ├── Dashboard.jsx     # Scenario 3
            ├── AddLoan.jsx       # Scenario 1 (input)
            └── LoanDetail.jsx    # Scenarios 1 & 2 (analysis + letters)
```

---

## Setup — Backend (FastAPI)

Open a terminal in VS Code (`Terminal > New Terminal`):

```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# Windows (PowerShell):
venv\Scripts\activate
# Windows (cmd):
venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Get a **free Gemini API key**: https://aistudio.google.com/app/apikey

```bash
cp .env.example .env
# then open .env in VS Code and paste your key into GEMINI_API_KEY
```

> The app works even without a key — negotiation letters fall back to a
> template-based generator — but real AI-personalized letters need the key.

Run the server:

```bash
uvicorn main:app --reload --port 8000
```

- API root: http://localhost:8000
- Interactive Swagger docs: http://localhost:8000/docs
- The SQLite file `debt_relief.db` is created automatically on first run.

---

## Setup — Frontend (React + Vite)

Open a **second** terminal (keep the backend running in the first one):

```bash
cd frontend
npm install
npm run dev
```

- App runs at: http://localhost:5173
- It calls the backend at `http://localhost:8000` (configured in `src/api.js`).

---

## VS Code tips

- Install the **Python** and **ES7+ React/Redux/React-Native snippets**
  extensions for a smoother experience.
- Open the whole `debt-relief-platform` folder as your VS Code workspace so
  both `backend/` and `frontend/` show up in the Explorer side-by-side.
- To run both servers at once, use two split terminals
  (`Terminal > Split Terminal`).

---

## API quick reference

| Method | Endpoint                          | Purpose                                  |
|--------|------------------------------------|-------------------------------------------|
| POST   | `/loans`                           | Create a loan                             |
| GET    | `/loans`                           | List all loans                            |
| GET    | `/loans/{id}`                      | Get one loan                              |
| GET    | `/loans/{id}/analysis`             | Loan + financial health analysis          |
| DELETE | `/loans/{id}`                      | Delete a loan                             |
| POST   | `/negotiation/generate`            | Generate an AI negotiation letter         |
| GET    | `/negotiation/history/{loan_id}`   | Get negotiation history for a loan        |
| GET    | `/dashboard/summary`               | Aggregate dashboard stats                 |

---

## Next steps / ideas to extend

- Add user authentication (JWT) so each borrower only sees their own loans.
- Add a PDF export of the generated negotiation letter.
- Add charts (e.g. Chart.js) for EMI ratio trends over time.
- Deploy backend to Render and frontend to Vercel (your usual stack).
