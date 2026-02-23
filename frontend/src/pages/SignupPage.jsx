import axios from 'axios'
import { Formik, Form, Field } from 'formik'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../auth/useAuth.js'

import buildSignupSchema from '../validation/signupSchema.js'

export default function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const auth = useAuth()

  const schema = buildSignupSchema(t)

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus(null)

    try {
      const payload = {
        username: values.username.trim(),
        password: values.password,
      }

      const res = await axios.post('/api/v1/signup', payload)
      auth.logIn(res.data)
      navigate('/', { replace: true })
    }
    catch (e) {
      if (e?.response?.status === 409) {
        setStatus(t('auth.userExists'))
      }
      else {
        setStatus(t('auth.signupFailed'))
      }
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
          <h1 className="h3 mb-4">{t('auth.signupTitle')}</h1>

          <Formik
            initialValues={{ username: '', password: '', confirmPassword: '' }}
            validationSchema={schema}
            validateOnBlur
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status, errors, touched }) => (
              <Form autoComplete="off">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    {t('auth.username')}
                  </label>
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="off"
                    className="form-control"
                  />
                  {touched.username && errors.username && (
                    <div className="text-danger small mt-1">
                      {errors.username}
                    </div>
                  )}
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
                  {touched.password && errors.password && (
                    <div className="text-danger small mt-1">
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    {t('auth.confirmPassword')}
                  </label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="off"
                    className="form-control"
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <div className="text-danger small mt-1">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {status && (
                  <div className="mb-3 text-danger">
                    {status}
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? t('common.sending') : t('auth.signUp')}
                </button>

                <div className="mt-3 small">
                  {t('auth.haveAccount')}
                  {' '}
                  <Link to="/login">{t('auth.loginLink')}</Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
