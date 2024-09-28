import { useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';

import { useTick } from './use-tick';

export const usePeers = () => {
  const socket = useSocket();
  const tick = useTick();
  const [peers, setPeers] = useState<number>(0x00);

  useEffect(() => {
    socket?.send('net_peerCount', []).then(setPeers);
  }, [socket, tick]);

  return useMemo(() => parseInt(peers.toString(), 16), [peers]);
};
