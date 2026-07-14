from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from services.financial_analysis import compute_financial_health

router = APIRouter(prefix="/loans", tags=["Loans"])


@router.post("", response_model=schemas.LoanOut)
def create_loan(loan_in: schemas.LoanCreate, db: Session = Depends(get_db)):
    loan = models.Loan(**loan_in.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.get("", response_model=list[schemas.LoanOut])
def list_loans(db: Session = Depends(get_db)):
    return db.query(models.Loan).order_by(models.Loan.created_at.desc()).all()


@router.get("/{loan_id}", response_model=schemas.LoanOut)
def get_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan


@router.get("/{loan_id}/analysis", response_model=schemas.LoanWithAnalysis)
def get_loan_analysis(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    analysis = compute_financial_health(loan)
    return {"loan": loan, "analysis": analysis}


@router.delete("/{loan_id}")
def delete_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()
    return {"detail": "Loan deleted"}
