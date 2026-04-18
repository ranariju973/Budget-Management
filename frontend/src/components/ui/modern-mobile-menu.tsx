import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Home, Briefcase, Calendar, Shield, Settings } from 'lucide-react';

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  activeIndex?: number;
  onItemClick?: (index: number) => void;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: 'home', icon: Home },
  { label: 'strategy', icon: Briefcase },
  { label: 'period', icon: Calendar },
  { label: 'security', icon: Shield },
  { label: 'settings', icon: Settings },
];

const defaultAccentColor = 'var(--component-active-color-default)';

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor,
  activeIndex,
  onItemClick,
}) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 8;
    if (!isValid) {
      console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", items);
      return defaultItems;
    }
    return items;
  }, [items]);

  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const resolvedActiveIndex =
    typeof activeIndex === 'number' && activeIndex >= 0 && activeIndex < finalItems.length
      ? activeIndex
      : internalActiveIndex;

  useEffect(() => {
    if (typeof activeIndex !== 'number' && internalActiveIndex >= finalItems.length) {
      setInternalActiveIndex(0);
    }
  }, [finalItems, internalActiveIndex, activeIndex]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[resolvedActiveIndex];
      const activeTextElement = textRefs.current[resolvedActiveIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();
    window.addEventListener('resize', setLineWidth);

    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [resolvedActiveIndex, finalItems]);

  const handleItemClick = (index: number) => {
    if (typeof activeIndex !== 'number') {
      setInternalActiveIndex(index);
    }
    onItemClick?.(index);
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]);

  return (
    <nav className="menu" role="navigation" style={navStyle}>
      {finalItems.map((item, index) => {
        const isActive = index === resolvedActiveIndex;
        const IconComponent = item.icon;

        return (
          <button
            key={`${item.label}-${index}`}
            className={`menu__item ${isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            style={{ '--lineWidth': '0px' } as React.CSSProperties}
            type="button"
            aria-label={item.label}
          >
            <div className="menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`menu__text ${isActive ? 'active' : ''}`}
              ref={(el) => {
                textRefs.current[index] = el;
              }}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu };
