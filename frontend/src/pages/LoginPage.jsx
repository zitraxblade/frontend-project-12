import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <h1>{t('auth.loginTitle')}</h1>

      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setStatus(null);
          try {
            const res = await axios.post('/api/v1/login', values);
            auth.logIn(res.data);
            navigate('/', { replace: true });
          } catch (e) {
            setStatus(t('auth.wrongCreds'));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: 6 }}>
                {t('auth.yourNick')}
              </label>
              <Field id="username" name="username" type="text" autoComplete="username" />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 6 }}>
                {t('auth.password')}
              </label>
              <Field id="password" name="password" type="password" autoComplete="current-password" />
            </div>

            {status && (
              <div style={{ marginBottom: 12, color: 'crimson' }}>
                {status}
              </div>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
            </button>

            <div style={{ marginTop: 12, fontSize: 12 }}>
              {t('auth.testUser')}
            </div>

            <div style={{ marginTop: 12, fontSize: 12 }}>
              {t('auth.noAccount')} <Link to="/signup">{t('auth.registerLink')}</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}