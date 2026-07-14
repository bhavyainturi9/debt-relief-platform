from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from services.financial_analysis import compute_financial_health
from services.gemini_service import generate_negotiation_letter

router = APIRouter(prefix="/negotiation", tags=["Negotiation"])


@router.post("/generate", response_model=schemas.NegotiationOut)
def generate_letter(req: schemas.NegotiationRequest, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == req.loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    analysis = compute_financial_health(loan)
    letter_text = generate_negotiation_letter(
        loan, analysis, letter_type=req.letter_type, tone=req.tone
    )

    record = models.NegotiationHistory(
        loan_id=loan.id,
        letter_type=req.letter_type,
        generated_text=letter_text,
        debt_stress_level=analysis["debt_stress_level"],
        settlement_percentage=analysis["recommended_settlement_percentage"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/history/{loan_id}", response_model=list[schemas.NegotiationOut])
def get_history(loan_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.NegotiationHistory)
        .filter(models.NegotiationHistory.loan_id == loan_id)
        .order_by(models.NegotiationHistory.created_at.desc())
        .all()
    )
