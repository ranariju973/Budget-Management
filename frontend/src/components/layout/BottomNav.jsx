import { useTheme } from '../../context/ThemeContext';
import {
  Home,
  Search,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { InteractiveMenu } from '@/components/ui/modern-mobile-menu';

const navItems = [
  { label: 'Dash', icon: Home, section: 'dashboard' },
  { label: 'Search', icon: Search, section: 'search' },
  { label: 'Expenses', icon: CreditCard, section: 'expenses' },
  { label: 'Borrow', icon: ArrowDownLeft, section: 'borrowing' },
  { label: 'Lend', icon: ArrowUpRight, section: 'lending' },
  { label: 'Split', icon: Users, section: 'split' },
];

const BottomNav = ({ activeSection, setActiveSection }) => {
  const { darkMode } = useTheme();
  const activeIndex = navItems.findIndex((item) => item.section === activeSection);

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
      <div className="px-2 py-2">
        <InteractiveMenu
          items={navItems.map((item) => ({ label: item.label, icon: item.icon }))}
          activeIndex={activeIndex >= 0 ? activeIndex : 0}
          accentColor={darkMode ? '#ffffff' : '#111827'}
          onItemClick={(index) => {
            const targetSection = navItems[index]?.section;
            if (targetSection) setActiveSection(targetSection);
          }}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
