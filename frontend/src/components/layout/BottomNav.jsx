import { useRef, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Home,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
} from 'lucide-react';

const navItems = [
  { label: 'dash', icon: Home, section: 'dashboard' },
  { label: 'expenses', icon: CreditCard, section: 'expenses' },
  { label: 'borrow', icon: ArrowDownLeft, section: 'borrowing' },
  { label: 'lend', icon: ArrowUpRight, section: 'lending' },
  { label: 'split', icon: Users, section: 'split' },
];

const BottomNav = ({ activeSection, setActiveSection }) => {
  const { darkMode } = useTheme();
  const textRefs = useRef([]);
  const itemRefs = useRef([]);

  const activeIndex = useMemo(
    () => Math.max(0, navItems.findIndex((item) => item.section === activeSection)),
    [activeSection]
  );

  // Measure active text width and set --lineWidth CSS var for the underline
  useEffect(() => {
    const setLineWidth = () => {
      const activeItemEl = itemRefs.current[activeIndex];
      const activeTextEl = textRefs.current[activeIndex];

      if (activeItemEl && activeTextEl) {
        const textWidth = activeTextEl.offsetWidth;
        activeItemEl.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();
    window.addEventListener('resize', setLineWidth);
    return () => window.removeEventListener('resize', setLineWidth);
  }, [activeIndex]);

  const handleItemClick = (index) => {
    const targetSection = navItems[index]?.section;
    if (targetSection) {
      setActiveSection(targetSection);
    }
  };

  const navStyle = useMemo(() => {
    const activeColor = darkMode ? '#ffffff' : '#111827';
    return { '--component-active-color': activeColor };
  }, [darkMode]);

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
        <nav className="menu" role="navigation" style={navStyle}>
          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            const IconComponent = item.icon;

            return (
              <button
                key={item.section}
                type="button"
                className={`menu__item ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(index)}
                ref={(el) => (itemRefs.current[index] = el)}
                style={{ '--lineWidth': '0px' }}
              >
                <div className="menu__icon">
                  <IconComponent className="icon" />
                </div>
                <strong
                  className={`menu__text ${isActive ? 'active' : ''}`}
                  ref={(el) => (textRefs.current[index] = el)}
                >
                  {item.label}
                </strong>
              </button>
            );
          })}
        </nav>
      </div>
    </nav>
  );
};

export default BottomNav;
