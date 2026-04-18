import React from 'react';
import { InteractiveMenu, type InteractiveMenuItem } from '@/components/ui/modern-mobile-menu';
import { Home, Briefcase, Calendar, Shield, Settings } from 'lucide-react';

const lucideDemoMenuItems: InteractiveMenuItem[] = [
  { label: 'home', icon: Home },
  { label: 'strategy', icon: Briefcase },
  { label: 'period', icon: Calendar },
  { label: 'security', icon: Shield },
  { label: 'settings', icon: Settings },
];

const customAccentColor = 'var(--color-chart-2)';

const Default = () => {
  return <InteractiveMenu />;
};

const Customized = () => {
  return <InteractiveMenu items={lucideDemoMenuItems} accentColor={customAccentColor} />;
};

const ModernMobileMenuDemo = () => {
  return (
    <div className="space-y-4 p-4" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <Default />
      <Customized />
    </div>
  );
};

export { Default, Customized };
export default ModernMobileMenuDemo;
