import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Capacitor } from '@capacitor/core';
import { FiSun, FiMoon, FiLogOut, FiPieChart, FiDownload } from 'react-icons/fi';

const Navbar = ({ setActiveSection }) => {
  const { user, logout, deleteAccount } = useAuth();
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
          {!Capacitor.isNativePlatform() && (
            <a
              href="/FinKart.apk"
              download="FinKart.apk"
              className="flex lg:hidden items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-white shadow-sm active:scale-[0.96] transition-transform"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <FiDownload size={14} />
              Get App
            </a>
          )}

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

      {/* iOS-style Dropdown Menu - MOVED OUTSIDE HEADER TO FIX BACKDROP-FILTER BUG */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0" onClick={() => setMenuOpen(false)} />

          <div
            className="absolute top-[68px] right-4 w-[240px] rounded-[16px] shadow-2xl overflow-hidden"
            style={{
              backgroundColor: darkMode ? 'rgba(30,30,30,0.65)' : 'rgba(250,250,250,0.65)',
              border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            }}
          >
            <div className="px-4 py-3" style={{ borderBottom: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)' }}>
              <p className="font-semibold text-[13px] truncate" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
              <p className="text-[12px] truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
            </div>
            <div className="flex flex-col">
              <button
                onClick={() => { if (setActiveSection) setActiveSection('charts'); setMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3.5 text-[15px] font-medium active:bg-black/5 dark:active:bg-white/10 transition-colors"
                style={{ color: 'var(--color-text)', backgroundColor: 'transparent', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)' }}
              >
                Spend Analysis <FiPieChart size={18} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <button
                onClick={() => { toggleTheme(); setMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3.5 text-[15px] font-medium active:bg-black/5 dark:active:bg-white/10 transition-colors"
                style={{ color: 'var(--color-text)', backgroundColor: 'transparent', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)' }}
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'} {darkMode ? <FiSun size={18} style={{ color: 'var(--color-text-secondary)' }} /> : <FiMoon size={18} style={{ color: 'var(--color-text-secondary)' }} />}
              </button>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3.5 text-[15px] font-medium active:bg-black/5 dark:active:bg-white/10 transition-colors"
                style={{ color: 'var(--color-text)', backgroundColor: 'transparent', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)' }}
              >
                Logout <FiLogOut size={18} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to permanently delete your account? This will erase your personal financial data but preserve shared Split Groups math.")) {
                    deleteAccount();
                    setMenuOpen(false);
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 text-[15px] font-medium active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
                style={{ color: 'var(--color-danger)', backgroundColor: 'transparent' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
