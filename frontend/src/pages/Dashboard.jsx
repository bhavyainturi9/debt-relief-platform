import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import StatCard from '../components/StatCard'
import LoanCard from '../components/LoanCard'

const money = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getDashboardSummary()
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <div className="eyebrow">Financial Health Overview</div>
        <h1>Your debt recovery dashboard</h1>
        <p>
          Track EMI burden, debt stress, and settlement potential across every
          loan account in one place.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="loading-text">Loading dashboard…</p>}

      {summary && (
        <>
          <div className="stat-strip">
            <StatCard label="Total Loans" value={summary.total_loans} />
            <StatCard label="Total Outstanding" value={money(summary.total_outstanding)} />
            <StatCard label="Monthly EMI Load" value={money(summary.total_monthly_emi)} />
            <StatCard
              label="Critical Accounts"
              value={summary.critical_loans}
              critical={summary.critical_loans > 0}
            />
          </div>

          <div className="section-label">
            <span>Loan Accounts</span>
            <Link to="/add-loan" className="btn">+ Add Loan</Link>
          </div>

          {summary.loans.length === 0 ? (
            <div className="empty-state">
              No loans added yet. <Link to="/add-loan">Add your first loan</Link> to get
              an AI-powered settlement recommendation.
            </div>
          ) : (
            <div className="loan-grid">
              {summary.loans.map(({ loan, analysis }) => (
                <LoanCard key={loan.id} loan={loan} analysis={analysis} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
