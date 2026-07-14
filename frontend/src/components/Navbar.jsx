import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="brand">
        <span className="mark">◈</span>
        <span>Recovery Ledger</span>
      </div>
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/add-loan" className={({ isActive }) => (isActive ? 'active' : '')}>
          Add Loan
        </NavLink>
      </nav>
    </div>
  )
}
