import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Chat</h1>
      <p>
        Перейти к авторизации: <Link to="/login">/login</Link>
      </p>
    </div>
  );
}