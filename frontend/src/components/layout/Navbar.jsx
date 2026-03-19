import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 h-[60px] flex items-center justify-between px-4 lg:px-8 transition-colors"
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[18px] font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          FinKart
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile quick actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full tap-effect"
            style={{ color: 'var(--color-text)' }}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <button 
            onClick={logout} 
            className="p-2 rounded-full tap-effect"
            style={{ color: 'var(--color-danger)' }}
          >
            <FiLogOut size={20} />
          </button>
        </div>

        <div className="hidden sm:flex flex-col items-end mr-1">
          <span className="text-[14px] font-semibold leading-none tracking-tight" style={{ color: 'var(--color-text)' }}>
            {user?.name || 'User'}
          </span>
          <span className="text-[12px] mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>
            My Budget
          </span>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold shadow-sm"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)' }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
