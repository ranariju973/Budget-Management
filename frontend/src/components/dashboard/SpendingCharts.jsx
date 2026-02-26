import { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { getChartData } from '../../services/budgetGoalService';
import { formatCurrency } from '../../utils/helpers';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#818cf8', '#4f46e5', '#7c3aed', '#5b21b6',
  '#94a3b8', '#64748b', '#475569', '#334155',
];

const SpendingCharts = ({ month, year }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('doughnut');

  useEffect(() => {
    fetchChartData();
  }, [month, year]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const res = await getChartData(month, year);
      setChartData(res.data);
    } catch {
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="text-center py-10">
          <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
        </div>
      </div>
    );
  }

  if (!chartData || (chartData.categoryBreakdown.length === 0 && chartData.dailyTrend.length === 0)) {
    return (
      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Spending Charts</h3>
        <p className="text-xs text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
          No expense data yet. Add expenses to see charts.
        </p>
      </div>
    );
  }

  // Cache computed styles — only re-read when theme might change
  const { textColor, borderColor } = useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      textColor: styles.getPropertyValue('--color-text-muted').trim() || '#94a3b8',
      borderColor: styles.getPropertyValue('--color-border').trim() || '#e2e8f0',
    };
  }, [chartData]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8,
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx) => `${ctx.label || ''}: ${formatCurrency(ctx.raw)}`,
        },
      },
    },
  };

  // Doughnut chart data
  const doughnutData = {
    labels: chartData.categoryBreakdown.map((c) => c.category),
    datasets: [{
      data: chartData.categoryBreakdown.map((c) => c.total),
      backgroundColor: CHART_COLORS.slice(0, chartData.categoryBreakdown.length),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    ...commonOptions,
    cutout: '65%',
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: textColor,
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
    },
  };

  // Bar chart data
  const barData = {
    labels: chartData.categoryBreakdown.map((c) => c.category),
    datasets: [{
      data: chartData.categoryBreakdown.map((c) => c.total),
      backgroundColor: CHART_COLORS.slice(0, chartData.categoryBreakdown.length),
      borderRadius: 6,
      barThickness: 28,
    }],
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 10 } },
        border: { display: false },
      },
      y: {
        grid: { color: borderColor, lineWidth: 0.5 },
        ticks: {
          color: textColor,
          font: { size: 10 },
          callback: (val) => '₹' + val,
        },
        border: { display: false },
      },
    },
  };

  // Line chart (daily trend)
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyMap = {};
  chartData.dailyTrend.forEach((d) => { dailyMap[d.day] = d.total; });

  const lineData = {
    labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    datasets: [{
      data: Array.from({ length: daysInMonth }, (_, i) => dailyMap[i + 1] || 0),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
      borderWidth: 2,
    }],
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: { size: 9 },
          maxTicksLimit: 15,
        },
        border: { display: false },
      },
      y: {
        grid: { color: borderColor, lineWidth: 0.5 },
        ticks: {
          color: textColor,
          font: { size: 10 },
          callback: (val) => '₹' + val,
        },
        border: { display: false },
      },
    },
  };

  const tabs = [
    { id: 'doughnut', label: 'Categories' },
    { id: 'bar', label: 'Comparison' },
    { id: 'line', label: 'Daily Trend' },
  ];

  // Calculate total spending
  const totalSpending = chartData.categoryBreakdown.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Spending Charts</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Total: {formatCurrency(totalSpending)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
                boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: activeTab === 'doughnut' ? '280px' : '240px' }}>
        {activeTab === 'doughnut' && <Doughnut data={doughnutData} options={doughnutOptions} />}
        {activeTab === 'bar' && <Bar data={barData} options={barOptions} />}
        {activeTab === 'line' && <Line data={lineData} options={lineOptions} />}
      </div>

      {/* Category breakdown list */}
      {activeTab === 'doughnut' && (
        <div className="mt-4 space-y-2">
          {chartData.categoryBreakdown.map((cat, i) => (
            <div key={cat.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{cat.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{formatCurrency(cat.total)}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {totalSpending > 0 ? Math.round((cat.total / totalSpending) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpendingCharts;
