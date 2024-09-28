import { useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';

import { useTick } from './use-tick';

export const useSyncStatus = () => {
  const socket = useSocket();
  const [progress, setProgress] = useState<number>(0);
  const tick = useTick();

  useEffect(() => {
    socket?.send('eth_syncing', []).then((syncing) => {
      const currentBlock = syncing.currentBlock;
      const highestBlock = syncing.highestBlock;

      setProgress(Math.round((currentBlock / highestBlock) * 1_000_000) / 10_000);
    });
  }, [tick, socket]);

  return useMemo(() => progress, [progress]);
};
