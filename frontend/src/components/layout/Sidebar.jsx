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
} from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', icon: FiGrid, section: 'dashboard' },
  { label: 'Search', icon: FiSearch, section: 'search' },
  { label: 'Expenses', icon: FiCreditCard, section: 'expenses' },
  { label: 'Borrowing', icon: FiArrowDownLeft, section: 'borrowing' },
  { label: 'Lending', icon: FiArrowUpRight, section: 'lending' },
  { label: 'Analytics', icon: FiPieChart, section: 'charts' },
];

const Sidebar = ({ activeSection, setActiveSection, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleNavClick = (section) => {
    setActiveSection(section);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`desktop-sidebar fixed top-0 left-0 z-50 h-full w-60 flex flex-col transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-14" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
            FinKart
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <FiX size={18} />
          </button>
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
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  backgroundColor: isActive ? 'var(--color-surface-hover)' : 'transparent',
                  color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="pt-3" />
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'var(--color-danger)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
