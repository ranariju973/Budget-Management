import { useState, useEffect, useMemo } from 'react';

/**
 * Cold-start aware loading screen with fun facts to keep users entertained.
 */
const MESSAGES = [
  { text: 'Loading…', delay: 0 },
  { text: 'Waking up the server…', delay: 3000 },
  { text: 'Free servers sleep when idle — hang tight!', delay: 8000 },
  { text: 'Almost there, setting things up…', delay: 15000 },
  { text: 'Still working — thanks for your patience!', delay: 25000 },
  { text: 'Just a few more seconds…', delay: 40000 },
];

const FUN_FACTS = [
  '💡 The average person spends $1,497/month on non-essential items.',
  '🐌 A snail could travel the Great Wall of China in 4,575 days.',
  "💰 If you saved ₹1 every second, you'd be a crorepati in 115 days.",
  '☕ The world drinks 2.25 billion cups of coffee every day.',
  '🧠 Your brain uses 20% of your total energy — budgeting counts!',
  '🚀 Loading servers is still faster than waiting in a bank queue.',
  '🎵 This pause is shorter than most Bollywood songs.',
  '📱 The first smartphone cost $899 in 1994. Good thing apps are free!',
  '🌍 There are more mobile phones than toothbrushes in the world.',
  '🐢 Even the internet started slow — the first email took hours.',
  '💸 Impulse buys account for 40% of all e-commerce spending.',
  '🍕 Americans spend $46 billion on pizza every year.',
  '⏰ You blink about 15–20 times per minute. Count while you wait!',
  '🏦 The word "bank" comes from the Italian word "banco" (bench).',
  '🤖 This server is basically waking up from a nap. Relatable, right?',
];

const LoadingSpinner = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [funIndex, setFunIndex] = useState(0);

  // Pick a random starting fact, then cycle every 4s
  const shuffled = useMemo(() => {
    const arr = [...FUN_FACTS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle fun facts every 4 seconds (starts after 5s)
  useEffect(() => {
    if (elapsed < 5000) return;
    const factTimer = setInterval(() => {
      setFunIndex((prev) => (prev + 1) % shuffled.length);
    }, 4000);
    return () => clearInterval(factTimer);
  }, [elapsed >= 5000, shuffled.length]);

  useEffect(() => {
    for (let i = MESSAGES.length - 1; i >= 0; i--) {
      if (elapsed >= MESSAGES[i].delay) {
        setMsgIndex(i);
        break;
      }
    }
  }, [elapsed]);

  const seconds = Math.floor(elapsed / 1000);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="flex flex-col items-center gap-4 max-w-xs text-center px-4">
        {/* Animated spinner */}
        <div className="relative">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'var(--color-accent)' }}
          />
        </div>

        {/* Progressive message */}
        <p
          className="text-sm font-medium transition-opacity duration-300"
          style={{ color: 'var(--color-text)' }}
          key={msgIndex}
        >
          {MESSAGES[msgIndex].text}
        </p>

        {/* Timer shown after 3s */}
        {elapsed >= 3000 && (
          <p className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            {seconds}s
          </p>
        )}

        {/* Fun fact card — appears after 5s to entertain the user */}
        {elapsed >= 5000 && (
          <div
            className="mt-2 rounded-lg p-3 transition-all duration-500"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
              key={funIndex}
            >
              {shuffled[funIndex]}
            </p>
          </div>
        )}

        {/* Brief explanation */}
        {elapsed >= 5000 && (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
            Server is napping 😴 — takes 30-50s to wake up
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
