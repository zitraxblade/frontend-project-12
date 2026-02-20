import { useEffect, useRef } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import { buildAddChannelSchema } from '../../validation/channelSchemas.js'

export default function AddChannelModal({
  show,
  onHide,
  existingNames,
  onSubmit,
  submitting,
  submitError,
}) {
  const { t } = useTranslation()
  const inputRef = useRef(null)

  useEffect(() => {
    if (show) setTimeout(() => inputRef.current?.focus(), 0)
  }, [show])

  const schema = buildAddChannelSchema(t, existingNames)

  const safeHide = () => {
    if (!submitting) onHide()
  }

  return (
    <Modal show={show} onHide={safeHide} centered>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>{t('modals.addChannelTitle')}</Modal.Title>
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
                <Form.Label htmlFor="channel-name">
                  {t('modals.channelNameLabel')}
                </Form.Label>

                <Form.Control
                  id="channel-name"
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

              {submitError && (
                <div className="text-danger mt-2">
                  {submitError}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={safeHide} disabled={submitting}>
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
  )
}
