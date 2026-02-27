import { useState, useEffect } from 'react';

/**
 * Cold-start aware loading screen.
 * Shows progressive messages so users know the server is waking up
 * and don't leave the site thinking it's broken.
 */
const MESSAGES = [
  { text: 'Loading…', delay: 0 },
  { text: 'Waking up the server…', delay: 3000 },
  { text: 'Free servers sleep when idle — hang tight!', delay: 8000 },
  { text: 'Almost there, setting things up…', delay: 15000 },
  { text: 'Still working — thanks for your patience!', delay: 25000 },
  { text: 'Just a few more seconds…', delay: 40000 },
];

const LoadingSpinner = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Show the latest message whose delay has passed
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

        {/* Timer shown after 3s so user sees progress */}
        {elapsed >= 3000 && (
          <p className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            {seconds}s
          </p>
        )}

        {/* Explanation shown after 5s */}
        {elapsed >= 5000 && (
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Our server goes to sleep when inactive.
            <br />
            It takes 30–50s to wake up — please wait!
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
