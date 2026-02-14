import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <h1>Вход</h1>

      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setStatus(null);
          try {
            const res = await axios.post('/api/v1/login', values); // proxy в vite уже настроен
            auth.logIn(res.data); // { token, username }
            navigate('/', { replace: true });
          } catch (e) {
            setStatus('Неверные имя пользователя или пароль');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: 6 }}>
                Имя пользователя
              </label>
              <Field id="username" name="username" type="text" autoComplete="username" />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 6 }}>
                Пароль
              </label>
              <Field id="password" name="password" type="password" autoComplete="current-password" />
            </div>

            {status && (
              <div style={{ marginBottom: 12, color: 'crimson' }}>
                {status}
              </div>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Вход…' : 'Войти'}
            </button>

            <div style={{ marginTop: 12, fontSize: 12 }}>
              Тестовый пользователь: admin / admin
            </div>

            <div style={{ marginTop: 12, fontSize: 12 }}>
              Нет аккаунта? <Link to="/signup">Регистрация</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}