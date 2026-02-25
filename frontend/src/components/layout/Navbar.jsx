import { useAuth } from '../../context/AuthContext';
import { FiMenu } from 'react-icons/fi';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-8"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <FiMenu size={18} />
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Financial Dashboard
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
          {user?.name}
        </span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
