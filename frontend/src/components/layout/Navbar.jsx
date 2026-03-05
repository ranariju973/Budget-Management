import { useAuth } from '../../context/AuthContext';
import { FiMenu } from 'react-icons/fi';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      {/* Desktop Navbar */}
      <header
        className="desktop-navbar sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-8"
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
            {initial}
          </div>
        </div>
      </header>

      {/* Mobile Glass Navbar */}
      <header className="mobile-glass-navbar">
        <button className="mobile-glass-btn mobile-hamburger-btn glass-surface" onClick={onMenuClick}>
          <div className="mobile-hamburger-lines">
            <span />
            <span />
            <span />
          </div>
        </button>
        <button className="mobile-glass-btn mobile-avatar-btn glass-surface">
          <span className="mobile-avatar-letter">{initial}</span>
        </button>
      </header>
    </>
  );
};

export default Navbar;
