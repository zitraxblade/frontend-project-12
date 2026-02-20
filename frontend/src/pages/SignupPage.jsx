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
    } catch (e) {
      if (e?.response?.status === 409) {
        setStatus(t('auth.userExists'))
      } else {
        setStatus(t('auth.signupFailed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <h1>{t('auth.signupTitle')}</h1>

      <Formik
        initialValues={{ username: '', password: '', confirmPassword: '' }}
        validationSchema={schema}
        validateOnBlur
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status, errors, touched }) => (
          <Form>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: 6 }}>
                {t('auth.username')}
              </label>
              <Field id="username" name="username" type="text" autoComplete="username" />
              {touched.username && errors.username && (
                <div style={{ color: 'crimson', fontSize: 12, marginTop: 4 }}>
                  {errors.username}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 6 }}>
                {t('auth.password')}
              </label>
              <Field id="password" name="password" type="password" autoComplete="new-password" />
              {touched.password && errors.password && (
                <div style={{ color: 'crimson', fontSize: 12, marginTop: 4 }}>
                  {errors.password}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: 6 }}>
                {t('auth.confirmPassword')}
              </label>
              <Field
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <div style={{ color: 'crimson', fontSize: 12, marginTop: 4 }}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {status && (
              <div style={{ marginBottom: 12, color: 'crimson' }}>
                {status}
              </div>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.sending') : t('auth.signUp')}
            </button>

            <div style={{ marginTop: 12, fontSize: 12 }}>
              {t('auth.haveAccount')}
              {' '}
              <Link to="/login">{t('auth.loginLink')}</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
