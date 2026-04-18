import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import BottomNav from '../components/layout/BottomNav';
import SummaryCards from '../components/dashboard/SummaryCards';
import IncomeSection from '../components/dashboard/IncomeSection';
import ExpenseSection from '../components/dashboard/ExpenseSection';
import BorrowSection from '../components/dashboard/BorrowSection';
import LendSection from '../components/dashboard/LendSection';
import SpendingCharts from '../components/dashboard/SpendingCharts';
import MonthNavigator from '../components/dashboard/MonthNavigator';
import SearchResults from '../components/search/SearchResults';
import SplitGroupSection from '../components/dashboard/SplitGroupSection';
import ErrorBoundary from '../components/common/ErrorBoundary';
import useExpenseReminder from '../hooks/useExpenseReminder';
import { getCurrentMonthYear } from '../utils/helpers';

const Dashboard = () => {
  // Daily 10 PM browser notification — "Have you added your expenses?"
  useExpenseReminder();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const current = getCurrentMonthYear();
  const [month, setMonth] = useState(current.month);
  const [year, setYear] = useState(current.year);

  const isCurrentMonth = month === current.month && year === current.year;

  // Redirect to join page if there's a pending invite from before login
  useEffect(() => {
    const pendingInvite = sessionStorage.getItem('pendingInvite');
    if (pendingInvite) {
      sessionStorage.removeItem('pendingInvite');
      navigate(`/join/${pendingInvite}`);
    }
  }, [navigate]);

  const handleMonthChange = useCallback((m, y) => {
    setMonth(m);
    setYear(y);
  }, []);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const goToExpenses = useCallback(() => setActiveSection('expenses'), []);
  const goToBorrowing = useCallback(() => setActiveSection('borrowing'), []);
  const goToLending = useCallback(() => setActiveSection('lending'), []);
  const goToDashboard = useCallback(() => setActiveSection('dashboard'), []);

  const sectionProps = useMemo(() => ({ month, year, onDataChange: triggerRefresh }), [month, year, triggerRefresh]);

  const renderContent = () => {
    switch (activeSection) {
      case 'search':
        return <SearchResults onClose={goToDashboard} />;
      case 'split':
        return <SplitGroupSection />;
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="lg:ml-60 pb-20 lg:pb-0"> {/* padding bottom for mobile BottomNav */}
        <Navbar setActiveSection={setActiveSection} />

        <main className="px-4 py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto">
          {/* Header with Month Navigator */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                Overview
              </p>
              <MonthNavigator month={month} year={year} onChange={handleMonthChange} />
            </div>
            {!isCurrentMonth && (
              <span className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>
                Viewing past data
              </span>
            )}
          </div>

          {/* Summary */}
          <SummaryCards month={month} year={year} refreshKey={refreshKey} />

          {/* Sections */}
          <ErrorBoundary>
            <div className="mt-8">{renderContent()}</div>
          </ErrorBoundary>
        </main>
      </div>

      <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} />
    </div>
  );
};

export default Dashboard;
