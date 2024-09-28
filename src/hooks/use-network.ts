import { Network } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';

export const useNetwork = () => {
  const socket = useSocket();

  const [network, setNetwork] = useState<Network | null>(null);

  useEffect(() => {
    socket?.getNetwork().then(setNetwork);
  }, [socket]);

  return useMemo(() => {
    if (!network) {
      return null;
    }

    return {
      name: network.name,
      chainId: network.chainId.toString(),
    };
  }, [network]);
};
