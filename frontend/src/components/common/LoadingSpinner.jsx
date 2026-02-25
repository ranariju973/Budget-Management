const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'transparent' }} />
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
