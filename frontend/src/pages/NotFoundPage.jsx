import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>404</h1>
      <p>Страница не найдена</p>
      <Link to="/">На главную</Link>
    </div>
  );
}