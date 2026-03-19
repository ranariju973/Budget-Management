import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiPieChart } from 'react-icons/fi';

const Navbar = ({ setActiveSection }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Mobile iOS-style Dropdown Menu */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
            <div 
              className="absolute top-12 right-0 w-[220px] rounded-[20px] shadow-xl z-50 overflow-hidden lg:hidden"
              style={{
                backgroundColor: darkMode ? 'rgba(28,28,30,0.85)' : 'rgba(242,242,247,0.85)',
                border: '1px solid var(--color-border-subtle)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <p className="font-semibold text-[14px] truncate" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
                <p className="text-[12px] truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
              </div>
              <div className="p-1.5 flex flex-col gap-1">
                <button 
                  onClick={() => { if(setActiveSection) setActiveSection('charts'); setMenuOpen(false); }} 
                  className="w-full flex items-center justify-between px-3 py-2.5 text-[14px] font-medium rounded-[12px] tap-effect" 
                  style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
                >
                  Spend Analysis <FiPieChart size={16} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
                <button 
                  onClick={() => { toggleTheme(); setMenuOpen(false); }} 
                  className="w-full flex items-center justify-between px-3 py-2.5 text-[14px] font-medium rounded-[12px] tap-effect" 
                  style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
                >
                  {darkMode ? 'Light Mode' : 'Dark Mode'} {darkMode ? <FiSun size={16} style={{ color: 'var(--color-text-secondary)' }} /> : <FiMoon size={16} style={{ color: 'var(--color-text-secondary)' }} />}
                </button>
                <button 
                  onClick={() => { logout(); setMenuOpen(false); }} 
                  className="w-full flex items-center justify-between px-3 py-2.5 text-[14px] font-medium rounded-[12px] tap-effect" 
                  style={{ color: 'var(--color-danger)', backgroundColor: 'var(--color-surface)' }}
                >
                  Logout <FiLogOut size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
