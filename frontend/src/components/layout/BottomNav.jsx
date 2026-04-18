import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Home,
  Search,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { LimelightNav } from '@/components/ui/limelight-nav';

const NAV_ITEMS = [
  { id: 'dash', section: 'dashboard', icon: <Home />, label: 'Dash' },
  { id: 'search', section: 'search', icon: <Search />, label: 'Search' },
  { id: 'expenses', section: 'expenses', icon: <CreditCard />, label: 'Expenses' },
  { id: 'borrow', section: 'borrowing', icon: <ArrowDownLeft />, label: 'Borrow' },
  { id: 'lend', section: 'lending', icon: <ArrowUpRight />, label: 'Lend' },
  { id: 'split', section: 'split', icon: <Users />, label: 'Split' },
];

const BottomNav = ({ activeSection, setActiveSection }) => {
  const { darkMode } = useTheme();

  // Map activeSection string → index for the LimelightNav controlled activeIndex
  const activeIndex = Math.max(0, NAV_ITEMS.findIndex((item) => item.section === activeSection));

  const handleTabChange = (index) => {
    const section = NAV_ITEMS[index]?.section;
    if (section) {
      setActiveSection(section);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe transition-colors"
      style={{
        borderTop: '1px solid var(--color-border-subtle)',
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      <div className="flex justify-center px-2 py-1">
        <LimelightNav
          items={NAV_ITEMS}
          activeIndex={activeIndex}
          onTabChange={handleTabChange}
          className="w-full border-0 rounded-none h-14"
          iconContainerClassName="p-3"
          iconClassName="w-5 h-5"
          limelightClassName=""
        />
      </div>
    </div>
  );
};

export default BottomNav;
