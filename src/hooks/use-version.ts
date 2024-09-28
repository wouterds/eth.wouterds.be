import ms from 'ms';
import { capitalize } from 'radash';
import { useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';

import { useTick } from './use-tick';

export const useVersion = () => {
  const socket = useSocket();
  const tick = useTick({ interval: ms('5 seconds') });
  const [versionString, setVersionString] = useState('');

  useEffect(() => {
    socket?.send('web3_clientVersion', []).then(setVersionString);
  }, [socket, tick]);

  return useMemo(() => {
    const version = capitalize(versionString.match(/^([^/]+)\/v([\d.]+)/)?.[0] || 'Unknown');
    const platform = capitalize(versionString.match(/\/([\w-]+)\/go/)?.[1] || 'Unknown');

    return {
      version,
      platform,
    };
  }, [versionString]);
};
