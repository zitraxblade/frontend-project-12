import { Formik, Form, Field } from 'formik';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <h1>Вход</h1>

      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={() => {
          // отправку НЕ делаем на этом этапе
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: 6 }}>
                Имя пользователя
              </label>
              <Field
                id="username"
                name="username"
                type="text"
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 6 }}>
                Пароль
              </label>
              <Field
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              Войти
            </button>

            <div style={{ marginTop: 12 }}>
              <Link to="/">На главную</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}