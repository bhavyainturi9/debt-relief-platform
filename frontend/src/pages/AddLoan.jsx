import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const initialForm = {
  borrower_name: '',
  lender_name: '',
  loan_type: 'Personal Loan',
  outstanding_amount: '',
  emi: '',
  overdue_months: '',
  monthly_income: '',
  interest_rate: '',
}

export default function AddLoan() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        borrower_name: form.borrower_name,
        lender_name: form.lender_name,
        loan_type: form.loan_type,
        outstanding_amount: parseFloat(form.outstanding_amount),
        emi: parseFloat(form.emi),
        overdue_months: parseInt(form.overdue_months || '0', 10),
        monthly_income: parseFloat(form.monthly_income),
        interest_rate: parseFloat(form.interest_rate || '0'),
      }
      const loan = await api.createLoan(payload)
      navigate(`/loans/${loan.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="eyebrow">Loan Intake</div>
        <h1>Add a loan account</h1>
        <p>
          Enter the outstanding balance, EMI, overdue duration, and income to
          generate a settlement recommendation and debt stress analysis.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Borrower Name</label>
            <input required value={form.borrower_name} onChange={update('borrower_name')} placeholder="e.g. Bhavya Sri" />
          </div>
          <div className="field">
            <label>Lender Name</label>
            <input required value={form.lender_name} onChange={update('lender_name')} placeholder="e.g. HDFC Bank" />
          </div>

          <div className="field">
            <label>Loan Type</label>
            <select value={form.loan_type} onChange={update('loan_type')}>
              <option>Personal Loan</option>
              <option>Credit Card Debt</option>
              <option>Auto Loan</option>
              <option>Education Loan</option>
              <option>Home Loan</option>
              <option>Business Loan</option>
            </select>
          </div>
          <div className="field">
            <label>Interest Rate (% p.a.)</label>
            <input type="number" step="0.01" value={form.interest_rate} onChange={update('interest_rate')} placeholder="14.5" />
          </div>

          <div className="field">
            <label>Outstanding Amount (₹)</label>
            <input required type="number" step="0.01" value={form.outstanding_amount} onChange={update('outstanding_amount')} placeholder="250000" />
          </div>
          <div className="field">
            <label>Monthly EMI (₹)</label>
            <input required type="number" step="0.01" value={form.emi} onChange={update('emi')} placeholder="12000" />
          </div>

          <div className="field">
            <label>Overdue Duration (months)</label>
            <input type="number" value={form.overdue_months} onChange={update('overdue_months')} placeholder="0" />
          </div>
          <div className="field">
            <label>Monthly Income (₹)</label>
            <input required type="number" step="0.01" value={form.monthly_income} onChange={update('monthly_income')} placeholder="35000" />
          </div>
        </div>

        <button className="btn solid" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save & Analyze'}
        </button>
      </form>
    </div>
  )
}
