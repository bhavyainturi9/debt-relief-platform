from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from services.financial_analysis import compute_financial_health
import schemas

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummary)
def summary(db: Session = Depends(get_db)):
    loans = db.query(models.Loan).order_by(models.Loan.created_at.desc()).all()

    loans_with_analysis = []
    total_outstanding = 0.0
    total_emi = 0.0
    ratio_sum = 0.0
    critical_count = 0

    for loan in loans:
        analysis = compute_financial_health(loan)
        loans_with_analysis.append({"loan": loan, "analysis": analysis})
        total_outstanding += loan.outstanding_amount
        total_emi += loan.emi
        ratio_sum += analysis["emi_ratio"]
        if analysis["debt_stress_level"] == "Critical":
            critical_count += 1

    avg_ratio = round(ratio_sum / len(loans), 2) if loans else 0.0

    return {
        "total_loans": len(loans),
        "total_outstanding": round(total_outstanding, 2),
        "total_monthly_emi": round(total_emi, 2),
        "average_emi_ratio": avg_ratio,
        "critical_loans": critical_count,
        "loans": loans_with_analysis,
    }
