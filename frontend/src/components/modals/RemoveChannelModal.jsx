import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function RemoveChannelModal({
  show,
  onHide,
  channelName,
  onConfirm,
  submitting,
  submitError,
}) {
  const { t } = useTranslation();

  const safeHide = () => {
    if (!submitting) onHide();
  };

  return (
    <Modal show={show} onHide={safeHide} centered>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>{t('modals.removeChannelModalTitle')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div>{t('modals.removeConfirm', { name: channelName })}</div>
        {submitError && <div className="text-danger mt-2">{submitError}</div>}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={safeHide} disabled={submitting}>
          {t('common.cancel')}
        </Button>

        <Button variant="danger" onClick={onConfirm} disabled={submitting}>
          {submitting ? t('common.deleting') : t('common.delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}