import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import UserProfileSidebar from './UserProfileSidebar';

const Navbar = ({ setActiveSection }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
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

        <div className="flex items-center gap-4 relative">
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[14px] font-semibold leading-none tracking-tight" style={{ color: 'var(--color-text)' }}>
              {user?.name || 'User'}
            </span>
            <span className="text-[12px] mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>
              My Budget
            </span>
          </div>
          
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold shadow-sm tap-effect"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </button>
        </div>
      </header>

      {/* New Sliding Sidebar */}
      <UserProfileSidebar 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        setActiveSection={setActiveSection}
      />
    </>
  );
};

export default Navbar;
