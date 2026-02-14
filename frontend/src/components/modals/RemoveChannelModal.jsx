import { Modal, Button } from 'react-bootstrap';

export default function RemoveChannelModal({
  show,
  onHide,
  channelName,
  onConfirm,
  submitting,
  submitError,
}) {
  return (
    <Modal show={show} onHide={() => !submitting && onHide()} centered>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>Удалить канал</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div>Уверены, что хотите удалить канал <b>#{channelName}</b>?</div>
        {submitError && <div className="text-danger mt-2">{submitError}</div>}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Отменить
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Удаление…' : 'Удалить'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}