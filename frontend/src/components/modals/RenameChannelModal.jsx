import { useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';

export default function RenameChannelModal({
  show,
  onHide,
  initialName,
  existingNames,
  onSubmit,
  submitting,
  submitError,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) setTimeout(() => inputRef.current?.select(), 0);
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
        // можно оставить старое имя
        if (v === initialName.trim().toLowerCase()) return true;
        return !existingNames.includes(v);
      }),
  });

  return (
    <Modal show={show} onHide={() => !submitting && onHide()} centered>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>Переименовать канал</Modal.Title>
      </Modal.Header>

      <Formik
        enableReinitialize
        initialValues={{ name: initialName ?? '' }}
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
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              {submitError && <div className="text-danger mt-2">{submitError}</div>}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={onHide} disabled={submitting}>
                Отменить
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}