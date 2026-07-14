import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import StressGauge from '../components/StressGauge'

const money = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const TONES = ['professional', 'firm', 'empathetic']
const LETTER_TYPES = [
  { value: 'settlement_request', label: 'Settlement Request Letter' },
  { value: 'negotiation_email', label: 'Negotiation Email' },
]

export default function LoanDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [letterType, setLetterType] = useState('settlement_request')
  const [tone, setTone] = useState('professional')
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [generating, setGenerating] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([api.getLoanAnalysis(id), api.getNegotiationHistory(id)])
      .then(([analysisData, historyData]) => {
        setData(analysisData)
        setHistory(historyData)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const result = await api.generateNegotiationLetter({
        loan_id: parseInt(id, 10),
        letter_type: letterType,
        tone,
      })
      setGeneratedLetter(result.generated_text)
      setHistory([result, ...history])
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="page"><p className="loading-text">Loading loan details…</p></div>
  if (error && !data) return <div className="page"><div className="error-banner">{error}</div></div>
  if (!data) return null

  const { loan, analysis } = data

  return (
    <div className="page">
      <div className="page-header">
        <div className="eyebrow">
          <Link to="/">← Dashboard</Link>
        </div>
        <h1>{loan.lender_name}</h1>
        <p>{loan.loan_type} · {loan.borrower_name}</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="detail-grid">
        {/* LEFT: financial profile + AI settlement recommendation (Scenario 1) */}
        <div className="panel">
          <h2>Financial Health & Settlement Recommendation</h2>

          <div className="gauge-wrap">
            <StressGauge score={analysis.debt_stress_score} level={analysis.debt_stress_level} />
            <div className="gauge-readout">
              <div className="desc">Debt Stress Level</div>
              <span className={`stress-badge ${analysis.debt_stress_level}`}>
                {analysis.debt_stress_level}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="kv-row"><span className="k">Outstanding Amount</span><span className="v">{money(loan.outstanding_amount)}</span></div>
            <div className="kv-row"><span className="k">Monthly EMI</span><span className="v">{money(loan.emi)}</span></div>
            <div className="kv-row"><span className="k">Overdue Duration</span><span className="v">{loan.overdue_months} month(s)</span></div>
            <div className="kv-row"><span className="k">Monthly Income</span><span className="v">{money(loan.monthly_income)}</span></div>
            <div className="kv-row"><span className="k">EMI-to-Income Ratio</span><span className="v">{analysis.emi_ratio}%</span></div>
            <div className="kv-row"><span className="k">Monthly Surplus</span><span className="v">{money(analysis.monthly_surplus)}</span></div>
            <div className="kv-row"><span className="k">Recommended Settlement</span><span className="v">{money(analysis.recommended_settlement_amount)} ({analysis.recommended_settlement_percentage}%)</span></div>
          </div>

          <div className="insight-box">{analysis.insight}</div>
        </div>

        {/* RIGHT: AI negotiation letter generation (Scenario 2) + history (Scenario 3) */}
        <div className="panel">
          <h2>AI Negotiation Letter Generator</h2>

          <div className="field">
            <label>Letter Type</label>
            <select value={letterType} onChange={(e) => setLetterType(e.target.value)}>
              {LETTER_TYPES.map((lt) => (
                <option key={lt.value} value={lt.value}>{lt.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Tone</label>
            <div className="tone-select-row">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn ${tone === t ? 'solid' : 'ghost'}`}
                  onClick={() => setTone(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button className="btn solid" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating with Gemini…' : 'Generate Letter'}
          </button>

          {generatedLetter && <div className="letter-output">{generatedLetter}</div>}

          <div className="section-label" style={{ marginTop: 32 }}>
            <span>Negotiation History</span>
          </div>
          {history.length === 0 ? (
            <p className="loading-text">No letters generated yet for this loan.</p>
          ) : (
            history.map((h) => (
              <div className="history-item" key={h.id}>
                <div className="meta">
                  <span>{h.letter_type.replace('_', ' ')}</span>
                  <span>{new Date(h.created_at).toLocaleString()}</span>
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  Stress: {h.debt_stress_level} · Settlement: {h.settlement_percentage}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
