import axios from 'axios'
import { Formik, Form, Field } from 'formik'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../auth/useAuth.js'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const auth = useAuth()

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus(null)

    try {
      const res = await axios.post('/api/v1/login', values)
      auth.logIn(res.data)
      navigate('/', { replace: true })
    }
    catch {
      setStatus(t('auth.wrongCreds'))
    }
    finally {
      setSubmitting(false)
    }
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="auth-page">
      <div className="card shadow-sm auth-card">
        <div className="card-body">
          <h1 className="h3 mb-4">{t('auth.loginTitle')}</h1>

          <Formik
            initialValues={{ username: '', password: '' }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form autoComplete="off">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    {t('auth.yourNick')}
                  </label>
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="off"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    {t('auth.password')}
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="off"
                    className="form-control"
                  />
                </div>

                {status && (
                  <div className="mb-3 text-danger">
                    {status}
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                  {t('auth.signIn')}
                </button>

                <div className="mt-3 small">
                  {t('auth.testUser')}
                </div>

                <div className="mt-3 small">
                  {t('auth.noAccount')}
                  {' '}
                  <Link to="/signup">{t('auth.registerLink')}</Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
