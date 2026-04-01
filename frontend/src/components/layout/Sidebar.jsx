import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiGrid,
  FiCreditCard,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiLogOut,
  FiSun,
  FiMoon,
  FiX,
  FiPieChart,
  FiSearch,
  FiUsers,
  FiChevronDown,
} from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', icon: FiGrid, section: 'dashboard' },
  { label: 'Search', icon: FiSearch, section: 'search' },
  { label: 'Expenses', icon: FiCreditCard, section: 'expenses' },
  { label: 'Borrowing', icon: FiArrowDownLeft, section: 'borrowing' },
  { label: 'Lending', icon: FiArrowUpRight, section: 'lending' },
  { label: 'Analytics', icon: FiPieChart, section: 'charts' },
  { label: 'Split', icon: FiUsers, section: 'split' },
];

const Sidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout, deleteAccount } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  const handleNavClick = (section) => {
    setActiveSection(section);
  };

  return (
    <>
      <aside
        className="fixed top-0 left-0 z-40 h-full w-60 hidden lg:flex flex-col glass"
        style={{
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 h-14" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            FinKart
          </span>
        </div>

        {/* User */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;
            return (
              <button
                key={item.section}
                onClick={() => handleNavClick(item.section)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150"
                style={{
                  backgroundColor: isActive ? 'var(--color-surface-hover)' : 'transparent',
                  color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={16} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-6 space-y-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="pt-3" />
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150 tap-effect"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150 tap-effect"
            style={{ color: 'var(--color-danger)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <FiLogOut size={16} />
            Logout
          </button>
          
          <div className="pt-2 text-center" style={{ marginTop: 'auto' }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-center gap-1 mx-auto text-[11px] font-medium opacity-40 hover:opacity-100 transition-all duration-200"
              style={{ color: 'var(--color-text)' }}
            >
              Advanced <FiChevronDown size={12} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            
            {showAdvanced && (
              <div className="mt-2 anim-fade-up">
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to permanently delete your account? This will erase your personal financial data but preserve shared Split Groups math.")) {
                      deleteAccount();
                    }
                  }}
                  className="w-full px-3 py-2 text-[12px] font-medium rounded-lg text-red-500 hover:bg-red-500/10 transition-colors duration-150"
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
