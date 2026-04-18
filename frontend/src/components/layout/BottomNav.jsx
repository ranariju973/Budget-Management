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
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden pb-safe pointer-events-none">
      <div className="flex justify-center pointer-events-auto">
        <LimelightNav
          items={NAV_ITEMS}
          activeIndex={activeIndex}
          onTabChange={handleTabChange}
          className="w-full max-w-md rounded-xl h-16 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          iconContainerClassName="p-2"
          iconClassName="w-[22px] h-[22px]"
        />
      </div>
    </div>
  );
};

export default BottomNav;
