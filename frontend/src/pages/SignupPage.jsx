import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Card, Button, Form } from 'react-bootstrap';
import api from '../api.js';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const schema = yup.object({
    username: yup.string().trim().min(3).max(20).required('Обязательное поле'),
    password: yup.string().min(6, 'Не менее 6 символов').required('Обязательное поле'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Пароли должны совпадать')
      .required('Обязательное поле'),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    setServerError(null);

    try {
      const res = await api.post('/signup', {
        username: values.username.trim(),
        password: values.password,
      });

      // { token, username }
      auth.logIn(res.data);
      navigate('/', { replace: true });
    } catch (e) {
      if (e?.response?.status === 409) {
        setServerError('Такой пользователь уже существует');
      } else {
        setServerError('Не удалось зарегистрироваться. Попробуйте ещё раз.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3 d-flex justify-content-center">
      <Card style={{ maxWidth: 420, width: '100%' }}>
        <Card.Body>
          <Card.Title className="mb-3">Регистрация</Card.Title>

          <Formik
            initialValues={{ username: '', password: '', confirmPassword: '' }}
            validationSchema={schema}
            onSubmit={onSubmit}
          >
            {({
              handleSubmit, handleChange, values, errors, touched, isSubmitting,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control
                    ref={inputRef}
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    isInvalid={touched.username && !!errors.username}
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    isInvalid={touched.password && !!errors.password}
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Подтвердите пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                {serverError && <div className="text-danger mb-2">{serverError}</div>}

                <Button type="submit" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка…' : 'Зарегистрироваться'}
                </Button>

                <div className="mt-3 text-center">
                  Уже есть аккаунт? <Link to="/login">Войти</Link>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
}