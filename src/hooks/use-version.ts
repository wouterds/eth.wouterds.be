import { capitalize } from 'radash';
import { useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';

export const useVersion = () => {
  const socket = useSocket();

  const [versionString, setVersionString] = useState('');

  useEffect(() => {
    socket?.send('web3_clientVersion', []).then(setVersionString);
  }, [socket]);

  return useMemo(() => {
    const version = capitalize(versionString.match(/^([^/]+)\/v([\d.]+)/)?.[0] || 'Unknown');
    const platform = capitalize(versionString.match(/\/([\w-]+)\/go/)?.[1] || 'Unknown');

    return {
      version,
      platform,
    };
  }, [versionString]);
};
