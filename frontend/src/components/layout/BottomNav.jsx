import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Home,
  Search,
  CreditCard,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { InteractiveMenu } from '@/components/ui/modern-mobile-menu';

const navItems = [
  { label: 'dash', icon: Home, section: 'dashboard' },
  { label: 'search', icon: Search, section: 'search' },
  { label: 'expenses', icon: CreditCard, section: 'expenses' },
  { label: 'lend', icon: ArrowUpRight, section: 'lending' },
  { label: 'split', icon: Users, section: 'split' },
];

const BottomNav = ({ activeSection, setActiveSection }) => {
  const { darkMode } = useTheme();
  const menuRef = useRef(null);

  const handleMenuClickCapture = (event) => {
    if (!(event.target instanceof Element)) return;

    const clickedButton = event.target.closest('button.menu__item');
    if (!clickedButton || !menuRef.current?.contains(clickedButton)) return;

    const buttons = Array.from(menuRef.current.querySelectorAll('button.menu__item'));
    const index = buttons.indexOf(clickedButton);
    const targetSection = navItems[index]?.section;

    if (targetSection) {
      setActiveSection(targetSection);
    }
  };

  useEffect(() => {
    const index = navItems.findIndex((item) => item.section === activeSection);
    if (index < 0) return;

    const buttons = menuRef.current?.querySelectorAll('button.menu__item');
    const targetButton = buttons?.[index];

    if (targetButton && !targetButton.classList.contains('active')) {
      targetButton.click();
    }
  }, [activeSection]);

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
      <div ref={menuRef} className="px-2 py-2" onClickCapture={handleMenuClickCapture}>
        <InteractiveMenu
          items={navItems.map((item) => ({ label: item.label, icon: item.icon }))}
          accentColor={darkMode ? '#ffffff' : '#111827'}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
