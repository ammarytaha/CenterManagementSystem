import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'تأكيد',
  message,
  confirmText = 'تأكيد',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-body">{message}</p>
    </Modal>
  );
}
