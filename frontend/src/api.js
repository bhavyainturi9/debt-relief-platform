const BASE_URL = 'http://localhost:8000'

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed with status ${res.status}`)
  }
  return res.json()
}

export const api = {
  getLoans: () => fetch(`${BASE_URL}/loans`).then(handleResponse),

  getLoan: (id) => fetch(`${BASE_URL}/loans/${id}`).then(handleResponse),

  getLoanAnalysis: (id) =>
    fetch(`${BASE_URL}/loans/${id}/analysis`).then(handleResponse),

  createLoan: (data) =>
    fetch(`${BASE_URL}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteLoan: (id) =>
    fetch(`${BASE_URL}/loans/${id}`, { method: 'DELETE' }).then(handleResponse),

  getDashboardSummary: () =>
    fetch(`${BASE_URL}/dashboard/summary`).then(handleResponse),

  generateNegotiationLetter: (data) =>
    fetch(`${BASE_URL}/negotiation/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getNegotiationHistory: (loanId) =>
    fetch(`${BASE_URL}/negotiation/history/${loanId}`).then(handleResponse),
}
