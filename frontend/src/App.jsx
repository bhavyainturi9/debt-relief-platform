import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AddLoan from './pages/AddLoan'
import LoanDetail from './pages/LoanDetail'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-loan" element={<AddLoan />} />
        <Route path="/loans/:id" element={<LoanDetail />} />
      </Routes>
    </div>
  )
}
