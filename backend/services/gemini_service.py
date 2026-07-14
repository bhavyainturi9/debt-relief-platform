"""
Wraps Google Gemini API calls for AI-generated negotiation letters /
settlement request emails. Falls back to a template-based generator if no
GEMINI_API_KEY is configured, so the app still runs end-to-end without a key.
"""

import os
from dotenv import load_dotenv

from models import Loan

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

_model = None
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        _model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as exc:  # pragma: no cover
        print(f"[gemini_service] Could not initialize Gemini model: {exc}")
        _model = None


def _build_prompt(loan: Loan, analysis: dict, letter_type: str, tone: str) -> str:
    letter_label = (
        "a formal settlement request letter"
        if letter_type == "settlement_request"
        else "a negotiation email"
    )

    return f"""
You are a financial communications assistant helping a borrower negotiate
with a lender. Write {letter_label} in a {tone} tone.

Borrower: {loan.borrower_name}
Lender: {loan.lender_name}
Loan type: {loan.loan_type}
Outstanding amount: ₹{loan.outstanding_amount:,.0f}
Current EMI: ₹{loan.emi:,.0f}/month
Overdue duration: {loan.overdue_months} month(s)
Monthly income: ₹{loan.monthly_income:,.0f}
EMI-to-income ratio: {analysis['emi_ratio']}%
Debt stress level: {analysis['debt_stress_level']}
Recommended settlement offer: ₹{analysis['recommended_settlement_amount']:,.0f} "
    f"({analysis['recommended_settlement_percentage']}% of outstanding)

Requirements:
- Address it to the lender by name.
- Briefly and honestly explain the financial hardship without being overly dramatic.
- Propose the recommended settlement amount as a one-time or structured payment.
- Keep a respectful, cooperative tone that preserves the relationship with the lender.
- Close with a clear call to action requesting a written response within 7-10 business days.
- Keep it under 300 words.
- Do not use placeholder brackets like [Date] — write it as ready-to-send text, but you may leave "[Your Address]" and "[Date]" at the very top only.
""".strip()


def generate_negotiation_letter(loan: Loan, analysis: dict, letter_type: str = "settlement_request",
                                 tone: str = "professional") -> str:
    if _model is not None:
        try:
            prompt = _build_prompt(loan, analysis, letter_type, tone)
            response = _model.generate_content(prompt)
            text = (response.text or "").strip()
            if text:
                return text
        except Exception as exc:  # pragma: no cover
            print(f"[gemini_service] Gemini call failed, using fallback: {exc}")

    return _fallback_letter(loan, analysis, letter_type, tone)


def _fallback_letter(loan: Loan, analysis: dict, letter_type: str, tone: str) -> str:
    """Deterministic template used when no Gemini API key is configured
    or the API call fails, so the feature still works offline/without a key."""

    subject = (
        "Settlement Request for Outstanding Loan Account"
        if letter_type == "settlement_request"
        else f"Request to Discuss Repayment Options - {loan.loan_type}"
    )

    return f"""Subject: {subject}

Dear {loan.lender_name} Team,

I am writing regarding my {loan.loan_type} account with an outstanding balance of
₹{loan.outstanding_amount:,.0f}. Due to a change in my financial circumstances, my
current EMI of ₹{loan.emi:,.0f}/month now represents {analysis['emi_ratio']}% of my
monthly income, and the account is currently {loan.overdue_months} month(s) overdue.

I remain committed to resolving this obligation responsibly. Based on a review of my
finances, I would like to propose a one-time settlement of ₹{analysis['recommended_settlement_amount']:,.0f}
(approximately {analysis['recommended_settlement_percentage']}% of the outstanding
amount), or alternatively a restructured repayment plan that better aligns with my
current income.

I believe this proposal offers a fair and timely resolution for both parties and
helps avoid further delinquency on the account. I would appreciate the opportunity
to discuss this further and kindly request a written response within 7-10 business
days.

Thank you for your understanding and continued support.

Sincerely,
{loan.borrower_name}

[Note: Generated using the offline template — add a GEMINI_API_KEY in backend/.env for AI-personalized letters.]"""
