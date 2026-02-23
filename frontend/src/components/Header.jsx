import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'

export default function Header() {
  const auth = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    auth.logOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo">
        Hexlet Chat
      </Link>

      {auth.isAuthenticated && (
        <button type="button" className="btn btn-outline-secondary" onClick={onLogout}>
          Выйти
        </button>
      )}
    </header>
  )
}
