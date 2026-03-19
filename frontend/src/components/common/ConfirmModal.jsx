import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * ConfirmModal — accessible modal with portal rendering + Escape key support.
 * Renders via createPortal to document.body to escape parent overflow/z-index.
 * Uses useEffect for Escape key listener — auto-cleans up on unmount.
 *
 * @param {string}  confirmLabel - Label for the confirm button (default: "Delete")
 * @param {string}  confirmColor - Background color for the confirm button (default: danger)
 * @param {string}  cancelLabel  - Label for the cancel button (default: "Cancel")
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  confirmColor,
  cancelLabel = 'Cancel',
}) => {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const btnColor = confirmColor || 'var(--color-danger)';

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      />
      <div className="relative rounded-xl shadow-2xl max-w-sm w-full p-5 z-10" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{title}</h3>
        <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}>{cancelLabel}</button>
          <button onClick={onConfirm} className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors" style={{ backgroundColor: btnColor }}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
