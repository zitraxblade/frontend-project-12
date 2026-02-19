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
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #ddd',
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', fontWeight: 700 }}>
        Hexlet Chat
      </Link>

      {auth.isAuthenticated && (
        <button type="button" onClick={onLogout}>
          Выйти
        </button>
      )}
    </header>
  )
}
