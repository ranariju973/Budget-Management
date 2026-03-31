import { useTheme } from '../../context/ThemeContext';
import {
  FiGrid,
  FiCreditCard,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiSearch,
  FiAward,
} from 'react-icons/fi';

const navItems = [
  { label: 'Dash', icon: FiGrid, section: 'dashboard' },
  { label: 'Search', icon: FiSearch, section: 'search' },
  { label: 'Expenses', icon: FiCreditCard, section: 'expenses' },
  { label: 'Borrow', icon: FiArrowDownLeft, section: 'borrowing' },
  { label: 'Lend', icon: FiArrowUpRight, section: 'lending' },
  { label: 'Badges', icon: FiAward, section: 'achievements' },
];

const BottomNav = ({ activeSection, setActiveSection }) => {
  const { darkMode } = useTheme();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe transition-colors"
      style={{
        borderTop: '1px solid var(--color-border-subtle)',
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.section;
          return (
            <button
              key={item.section}
              onClick={() => setActiveSection(item.section)}
              className="flex flex-col items-center justify-center w-14 h-12 tap-effect"
              style={{
                color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
              }}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
