import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-8 glass"
      style={{
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[17px] font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
          FinKart
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[13px] font-medium leading-none" style={{ color: 'var(--color-text)' }}>
            {user?.name}
          </span>
          <span className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            My Budget
          </span>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
