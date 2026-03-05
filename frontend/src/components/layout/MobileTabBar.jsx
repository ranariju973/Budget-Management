import { FiSearch } from 'react-icons/fi';

const tabs = [
  { label: 'Expenses', section: 'expenses', icon: '◆' },
  { label: 'Borrow', section: 'borrowing', icon: '●' },
  { label: 'Lend', section: 'lending', icon: '▲' },
];

const MobileTabBar = ({ activeSection, onTabChange }) => {
  const getActiveTab = () => {
    if (['expenses', 'dashboard'].includes(activeSection)) return 'expenses';
    return activeSection;
  };

  const currentTab = getActiveTab();

  return (
    <div className="mobile-tab-bar">
      {/* Main tab pills */}
      <div className="mobile-tab-pills glass-surface">
        {tabs.map((tab) => (
          <button
            key={tab.section}
            className={`mobile-tab-item ${currentTab === tab.section ? 'active' : ''}`}
            onClick={() => onTabChange(tab.section)}
          >
            <span className="mobile-tab-icon">{tab.icon}</span>
            <span className="mobile-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search pill */}
      <div className="mobile-tab-search glass-surface">
        <button
          className={`mobile-tab-search-btn ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => onTabChange('search')}
        >
          <span className="mobile-tab-icon">
            <FiSearch size={20} strokeWidth={2.5} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileTabBar;
