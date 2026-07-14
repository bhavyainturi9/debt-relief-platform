"""
Core rule-based financial analysis engine.

This module has no external dependencies (no AI calls) so it stays fast,
deterministic, and testable. The Gemini service layer uses the output of
this module as grounding context for its generated text.
"""

from models import Loan


def compute_financial_health(loan: Loan) -> dict:
    emi_ratio = round((loan.emi / loan.monthly_income) * 100, 2) if loan.monthly_income else 0
    monthly_surplus = round(loan.monthly_income - loan.emi, 2)

    # --- Debt stress score (0-100) ---
    # Weighted blend of EMI burden, overdue duration, and negative surplus.
    emi_component = min(emi_ratio, 100) * 0.6
    overdue_component = min(loan.overdue_months * 6, 40) * 1.0  # up to 40 pts
    surplus_penalty = 20 if monthly_surplus < 0 else 0

    debt_stress_score = round(min(emi_component + overdue_component + surplus_penalty, 100))

    if debt_stress_score < 30:
        stress_level = "Low"
    elif debt_stress_score < 55:
        stress_level = "Moderate"
    elif debt_stress_score < 80:
        stress_level = "High"
    else:
        stress_level = "Critical"

    # --- Settlement percentage recommendation ---
    # Base logic: the more overdue and higher the stress, the lower the
    # settlement percentage a borrower can reasonably negotiate (i.e. lender
    # recovers less but faster/certain payment).
    base_pct = 75  # start negotiating from 75% of outstanding
    base_pct -= min(loan.overdue_months * 2, 30)   # longer overdue -> lower %
    if stress_level == "Moderate":
        base_pct -= 5
    elif stress_level == "High":
        base_pct -= 12
    elif stress_level == "Critical":
        base_pct -= 20

    settlement_pct = max(35, min(base_pct, 75))  # clamp between 35% and 75%
    settlement_amount = round(loan.outstanding_amount * settlement_pct / 100, 2)

    insight = _build_insight(stress_level, emi_ratio, monthly_surplus, loan.overdue_months)

    return {
        "emi_ratio": emi_ratio,
        "monthly_surplus": monthly_surplus,
        "debt_stress_level": stress_level,
        "debt_stress_score": debt_stress_score,
        "recommended_settlement_percentage": settlement_pct,
        "recommended_settlement_amount": settlement_amount,
        "insight": insight,
    }


def _build_insight(stress_level: str, emi_ratio: float, surplus: float, overdue_months: int) -> str:
    if stress_level == "Critical":
        return (
            f"Your EMI consumes {emi_ratio}% of monthly income and the account is "
            f"{overdue_months} month(s) overdue. Immediate lender contact and a "
            "lump-sum or structured settlement is strongly recommended to avoid "
            "further credit score damage."
        )
    if stress_level == "High":
        return (
            f"EMI burden is high at {emi_ratio}% of income. A settlement or EMI "
            "restructuring request is advisable before the account slips further "
            "into overdue status."
        )
    if stress_level == "Moderate":
        return (
            f"Your finances are manageable but tight, with a monthly surplus of "
            f"₹{surplus:.0f}. Consider building an emergency buffer or negotiating "
            "a lower interest rate."
        )
    return (
        f"Your debt position looks healthy with a monthly surplus of ₹{surplus:.0f} "
        "and low EMI burden. Continue regular payments to maintain credit health."
    )
