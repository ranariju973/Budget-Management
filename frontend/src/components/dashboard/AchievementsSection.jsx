import { useState, useEffect, useCallback } from 'react';
import { getAchievements, checkAchievements } from '../../services/achievementService';
import toast from 'react-hot-toast';

const CATEGORY_ORDER = ['Getting Started', 'Consistency', 'Savings', 'Borrowing', 'Lending', 'Planning', 'Milestones', 'Spending', 'Ultimate'];

const AchievementsSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchBadges = useCallback(async () => {
    try {
      const res = await getAchievements();
      setData(res.data);
    } catch {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await checkAchievements();
      setData(res.data);
      const newCount = res.data.newlyUnlocked?.length || 0;
      if (newCount > 0) {
        toast.success(`🎉 ${newCount} new badge${newCount > 1 ? 's' : ''} unlocked!`);
      } else {
        toast('No new badges yet — keep going! 💪', { icon: '🔒' });
      }
    } catch {
      toast.error('Failed to check achievements');
    } finally {
      setChecking(false);
    }
  };

  // Group badges by category
  const groupedBadges = {};
  if (data?.badges) {
    data.badges.forEach((badge) => {
      if (!groupedBadges[badge.category]) {
        groupedBadges[badge.category] = [];
      }
      groupedBadges[badge.category].push(badge);
    });
  }

  const progressPercent = data ? Math.round((data.unlocked / data.total) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton progress */}
        <div className="badge-hero rounded-[20px] p-6 animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="h-5 w-40 rounded" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
          <div className="h-3 w-full rounded-full mt-4" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
        </div>
        {/* Skeleton cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-[20px] p-5 animate-pulse"
              style={{ backgroundColor: 'var(--color-surface)', height: '160px' }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Progress Card */}
      <div
        className="badge-hero rounded-[20px] p-6 card-shadow"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Achievements
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {data.unlocked} of {data.total} badges unlocked
            </p>
          </div>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="badge-check-btn"
          >
            {checking ? (
              <span className="badge-check-spinner" />
            ) : (
              '🔍 Check Now'
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="badge-progress-track">
          <div
            className="badge-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-right text-[11px] mt-1.5 font-semibold tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          {progressPercent}%
        </p>
      </div>

      {/* Badge Groups */}
      {CATEGORY_ORDER.map((category) => {
        const badges = groupedBadges[category];
        if (!badges || badges.length === 0) return null;

        return (
          <div key={category}>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BadgeCard = ({ badge }) => {
  const { emoji, name, description, unlocked, unlockedAt } = badge;

  return (
    <div
      className={`badge-card ${unlocked ? 'badge-unlocked' : 'badge-locked'}`}
    >
      <div className="badge-emoji-wrap">
        <span className="badge-emoji">{unlocked ? emoji : '🔒'}</span>
      </div>
      <p className="badge-name">{unlocked ? name : '???'}</p>
      <p className="badge-desc">{unlocked ? description : 'Keep using FinKart to unlock!'}</p>
      {unlocked && unlockedAt && (
        <p className="badge-date">
          {new Date(unlockedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  );
};

export default AchievementsSection;
