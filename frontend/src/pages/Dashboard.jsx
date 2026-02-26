import { useState, useCallback, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import SummaryCards from '../components/dashboard/SummaryCards';
import IncomeSection from '../components/dashboard/IncomeSection';
import ExpenseSection from '../components/dashboard/ExpenseSection';
import BorrowSection from '../components/dashboard/BorrowSection';
import LendSection from '../components/dashboard/LendSection';
import SpendingCharts from '../components/dashboard/SpendingCharts';
import SearchResults from '../components/search/SearchResults';
import ErrorBoundary from '../components/common/ErrorBoundary';
import useExpenseReminder from '../hooks/useExpenseReminder';
import { getCurrentMonthYear, monthNames } from '../utils/helpers';

const Dashboard = () => {
  // Daily 10 PM browser notification — "Have you added your expenses?"
  useExpenseReminder();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const { month, year } = getCurrentMonthYear();
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const goToExpenses = useCallback(() => setActiveSection('expenses'), []);
  const goToBorrowing = useCallback(() => setActiveSection('borrowing'), []);
  const goToLending = useCallback(() => setActiveSection('lending'), []);
  const goToDashboard = useCallback(() => setActiveSection('dashboard'), []);

  const sectionProps = useMemo(() => ({ month, year, onDataChange: triggerRefresh }), [month, year, triggerRefresh]);

  const renderContent = () => {
    switch (activeSection) {
      case 'search':
        return <SearchResults onClose={goToDashboard} />;
      case 'expenses':
        return <ExpenseSection {...sectionProps} />;
      case 'borrowing':
        return <BorrowSection {...sectionProps} />;
      case 'lending':
        return <LendSection {...sectionProps} />;
      case 'charts':
        return <SpendingCharts month={month} year={year} />;
      default:
        return (
          <div className="space-y-5">
            <IncomeSection {...sectionProps} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <ExpenseSection {...sectionProps} preview onViewAll={goToExpenses} />
              <BorrowSection {...sectionProps} preview onViewAll={goToBorrowing} />
              <LendSection {...sectionProps} preview onViewAll={goToLending} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="lg:ml-60">
        <Navbar onMenuClick={openSidebar} />

        <main className="px-4 py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                Overview
              </p>
              <h2 className="text-2xl font-semibold mt-1" style={{ color: 'var(--color-text)' }}>
                {monthNames[month - 1]} {year}
              </h2>
            </div>
          </div>

          {/* Summary */}
          <SummaryCards month={month} year={year} refreshKey={refreshKey} />

          {/* Sections */}
          <ErrorBoundary>
            <div className="mt-8">{renderContent()}</div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
