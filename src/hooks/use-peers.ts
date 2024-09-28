import { useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';

export const usePeers = () => {
  const socket = useSocket();

  const [peers, setPeers] = useState<number>(0x00);

  useEffect(() => {
    socket?.send('net_peerCount', []).then(setPeers);
  }, [socket]);

  return useMemo(() => parseInt(peers.toString(), 16), [peers]);
};
