from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


# ---------- Loan schemas ----------

class LoanCreate(BaseModel):
    borrower_name: str
    lender_name: str
    loan_type: str = "Personal Loan"
    outstanding_amount: float = Field(gt=0)
    emi: float = Field(gt=0)
    overdue_months: int = Field(ge=0, default=0)
    monthly_income: float = Field(gt=0)
    interest_rate: float = Field(ge=0, default=0.0)


class LoanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    borrower_name: str
    lender_name: str
    loan_type: str
    outstanding_amount: float
    emi: float
    overdue_months: int
    monthly_income: float
    interest_rate: float
    created_at: datetime


# ---------- Financial analysis schemas ----------

class FinancialAnalysis(BaseModel):
    emi_ratio: float
    monthly_surplus: float
    debt_stress_level: str
    debt_stress_score: int
    recommended_settlement_percentage: float
    recommended_settlement_amount: float
    insight: str


class LoanWithAnalysis(BaseModel):
    loan: LoanOut
    analysis: FinancialAnalysis


# ---------- Negotiation schemas ----------

class NegotiationRequest(BaseModel):
    loan_id: int
    letter_type: str = "settlement_request"  # or "negotiation_email"
    tone: str = "professional"  # professional | firm | empathetic


class NegotiationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    loan_id: int
    letter_type: str
    generated_text: str
    debt_stress_level: Optional[str] = None
    settlement_percentage: Optional[float] = None
    created_at: datetime


# ---------- Dashboard schemas ----------

class DashboardSummary(BaseModel):
    total_loans: int
    total_outstanding: float
    total_monthly_emi: float
    average_emi_ratio: float
    critical_loans: int
    loans: List[LoanWithAnalysis]
