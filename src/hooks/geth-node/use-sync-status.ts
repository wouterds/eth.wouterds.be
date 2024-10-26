import { useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';
import { useTick } from '~/hooks';

export const useSyncStatus = () => {
  const socket = useSocket();
  const tick = useTick();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    socket?.send('eth_syncing', []).then((syncing) => {
      if (syncing === false) {
        setProgress(100);
        return;
      }

      setProgress(Math.round((syncing.currentBlock / syncing.highestBlock) * 1_000_000) / 10_000);
    });
  }, [tick, socket]);

  return useMemo(() => progress, [progress]);
};
