import { useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';

export default function AddChannelModal({
  show,
  onHide,
  existingNames,
  onSubmit,
  submitting,
  submitError,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) setTimeout(() => inputRef.current?.focus(), 0);
  }, [show]);

  const schema = yup.object({
    name: yup
      .string()
      .trim()
      .min(3, 'От 3 до 20 символов')
      .max(20, 'От 3 до 20 символов')
      .required('Обязательное поле')
      .test('unique', 'Должно быть уникальным', (value) => {
        const v = (value ?? '').trim().toLowerCase();
        return !existingNames.includes(v);
      }),
  });

  return (
    <Modal show={show} onHide={() => !submitting && onHide()} centered>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>Добавить канал</Modal.Title>
      </Modal.Header>

      <Formik
        initialValues={{ name: '' }}
        validationSchema={schema}
        onSubmit={(values) => onSubmit(values.name.trim())}
      >
        {({
          handleSubmit, handleChange, values, errors, touched,
        }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group>
                <Form.Label className="visually-hidden">Имя канала</Form.Label>
                <Form.Control
                  ref={inputRef}
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  isInvalid={touched.name && !!errors.name}
                  placeholder="Имя канала"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              {submitError && (
                <div className="text-danger mt-2">
                  {submitError}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={onHide} disabled={submitting}>
                Отменить
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Отправка…' : 'Отправить'}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}