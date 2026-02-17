import { useEffect, useMemo, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.select();
    }, 0);
  }, [show]);

  const normalizedExisting = useMemo(
    () => (existingNames ?? []).map((n) => String(n).trim().toLowerCase()),
    [existingNames],
  );

  const schema = yup.object({
    name: yup
      .string()
      .transform((v) => (v ?? '').trim())
      .min(3, t('validation.usernameLen'))
      .max(20, t('validation.usernameLen'))
      .required(t('validation.required'))
      .test('unique', t('validation.mustBeUnique'), (value) => {
        const v = String(value ?? '').trim().toLowerCase();
        const init = String(initialName ?? '').trim().toLowerCase();
        if (v === init) return true;
        return !normalizedExisting.includes(v);
      }),
  });

  return (
    <Modal show={show} onHide={() => !submitting && onHide()} centered>
      <Modal.Header closeButton={!submitting}>
        {/* ✅ Заголовок = "Переименовать" */}
        <Modal.Title>{t('modals.renameChannelTitle')}</Modal.Title>
      </Modal.Header>

      <Formik
        enableReinitialize
        initialValues={{ name: initialName ?? '' }}
        validationSchema={schema}
        onSubmit={(values) => onSubmit(String(values.name ?? '').trim())}
      >
        {({
          handleSubmit, handleChange, values, errors, touched,
        }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group>
                <Form.Label htmlFor="rename-channel-name">
                  {t('modals.channelNameLabel')}
                </Form.Label>

                <Form.Control
                  id="rename-channel-name"
                  ref={inputRef}
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  isInvalid={touched.name && !!errors.name}
                  placeholder={t('modals.channelNameLabel')}
                  aria-label={t('modals.channelNameLabel')}
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
                {t('common.cancel')}
              </Button>

              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? t('common.sending') : t('common.send')}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}