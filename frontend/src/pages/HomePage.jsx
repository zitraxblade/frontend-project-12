import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    auth.logOut();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Chat</h1>
      <p>Вы вошли как: <b>{auth.username}</b></p>
      <button type="button" onClick={onLogout}>Выйти</button>
      <p style={{ marginTop: 16 }}>Здесь будет чат на следующих этапах.</p>
    </div>
  );
}