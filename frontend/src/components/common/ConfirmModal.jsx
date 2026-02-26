const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-xl shadow-2xl max-w-sm w-full p-5 z-10" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{title}</h3>
        <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}>Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors" style={{ backgroundColor: 'var(--color-danger)' }}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
