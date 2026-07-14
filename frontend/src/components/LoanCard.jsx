import { Link } from 'react-router-dom'

const money = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function LoanCard({ loan, analysis }) {
  return (
    <Link to={`/loans/${loan.id}`} className="loan-card">
      <div className="loan-card-top">
        <div>
          <h3>{loan.lender_name}</h3>
          <div className="lender">{loan.loan_type} · {loan.borrower_name}</div>
        </div>
        <span className={`stress-badge ${analysis.debt_stress_level}`}>
          {analysis.debt_stress_level}
        </span>
      </div>
      <div className="amount-row">
        <div>
          Outstanding
          <br />
          <strong>{money(loan.outstanding_amount)}</strong>
        </div>
        <div>
          EMI ratio
          <br />
          <strong>{analysis.emi_ratio}%</strong>
        </div>
        <div>
          Overdue
          <br />
          <strong>{loan.overdue_months} mo</strong>
        </div>
      </div>
    </Link>
  )
}
