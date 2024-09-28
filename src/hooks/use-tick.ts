import ms from 'ms';
import { useEffect, useMemo, useState } from 'react';

export const useTick = (options?: { interval?: number; disabled?: boolean }) => {
  const intervalMs = options?.interval || ms('1 second');
  const disabled = options?.disabled || false;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, disabled]);

  return useMemo(() => tick, [tick]);
};
