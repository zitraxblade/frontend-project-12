import axios from 'axios'
import { Formik, Form, Field } from 'formik'
import * as yup from 'yup'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../auth/useAuth.js'

export default function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const auth = useAuth()

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const schema = yup.object({
    username: yup
      .string()
      .trim()
      .min(3, t('validation.usernameLen'))
      .max(20, t('validation.usernameLen'))
      .required(t('validation.required')),
    password: yup
      .string()
      .min(6, t('validation.passwordMin'))
      .required(t('validation.required')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t('validation.passwordsMustMatch'))
      .required(t('validation.required')),
  })

  return (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <h1>{t('auth.signupTitle')}</h1>

      <Formik
        initialValues={{ username: '', password: '', confirmPassword: '' }}
        validationSchema={schema}
        validateOnBlur
        onSubmit={async (values, { setSubmitting, setStatus }) => {
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
        }}
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
              <Field id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" />
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
