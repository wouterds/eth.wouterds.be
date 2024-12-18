import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { format, formatDistanceToNowStrict, fromUnixTime } from 'date-fns';
import { useMemo } from 'react';

import { useBlocks, useNetwork, usePeers, useSyncStatus, useVersion } from '~/hooks';
import { getLatestBlocks } from '~/services/geth-node';
import { formatBlockNumber, hexToAscii } from '~/utils';

export const meta: MetaFunction = () => {
  return [{ title: 'eth.wouterds.be' }];
};

export const loader = async () => {
  const initialBlocks = await getLatestBlocks(20);

  return { initialBlocks };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const { blocks, block } = useBlocks(data.initialBlocks);
  const network = useNetwork();
  const progress = useSyncStatus();
  const peers = usePeers();
  const { version, platform } = useVersion();

  const stats = useMemo(() => {
    return [
      {
        label: 'Version',
        value: version || 'Unknown',
      },
      {
        label: 'Platform',
        value: platform || 'Unknown',
      },
      {
        label: 'Network',
        value: network?.name || 'Unknown',
      },
      {
        label: 'Chain ID',
        value: network?.chainId || 'Unknown',
      },
      {
        label: 'Peers',
        value: peers || 'Unknown',
      },
      {
        label: 'Block',
        value: `#${formatBlockNumber(block.number)}`,
      },
      {
        label: 'Sync status',
        value: progress ? `${progress.toFixed(2)}%` : 'Unknown',
      },
      {
        label: 'Synced until',
        value: format(fromUnixTime(block.timestamp), 'MMM dd yyyy, HH:mm:ss'),
      },
    ];
  }, [network, progress, block, peers, version, platform]);

  return (
    <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white p-8 lg:p-12">
      <div className="flex justify-between items-center mb-4 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">eth.wouterds.be</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-8 lg:mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-4 lg:p-6 shadow-sm">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2 lg:mb-3">
              {stat.label}
            </span>
            <span className="text-lg lg:text-xl font-bold font-mono">{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-4 lg:p-6 shadow-sm">
        <h2 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6">Recent blocks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-700 dark:bg-opacity-50">
              <tr>
                <th className="font-medium text-zinc-500 dark:text-zinc-300 text-left px-4 py-2">
                  Block
                </th>
                <th className="font-medium text-zinc-500 dark:text-zinc-300 text-left px-4 py-2">
                  Hash
                </th>
                <th className="font-medium text-zinc-500 dark:text-zinc-300 text-left px-4 py-2">
                  Transactions
                </th>
                <th className="font-medium text-zinc-500 dark:text-zinc-300 text-left px-4 py-2">
                  Extra data
                </th>
                <th className="font-medium text-zinc-500 dark:text-zinc-300 text-left px-4 py-2">
                  Age
                </th>
                <th className="font-medium text-zinc-500 dark:text-zinc-300 text-left px-4 py-2">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {blocks.map((block) => (
                <tr key={block.number} className="text-nowrap text-zinc-500 dark:text-zinc-300">
                  <td className="px-4 py-2 text-zinc-700 dark:text-zinc-100 font-mono">
                    #{formatBlockNumber(block.number)}
                  </td>
                  <td className="px-4 py-2 truncate max-w-96 font-mono">{block.hash}</td>
                  <td className="px-4 py-2 font-mono">{block.transactions.length}</td>
                  <td className="px-4 py-2">{hexToAscii(block.extraData) || block.extraData}</td>
                  <td className="px-4 py-2">
                    {formatDistanceToNowStrict(fromUnixTime(block.timestamp))}
                  </td>
                  <td className="px-4 py-2">
                    {format(fromUnixTime(block.timestamp), 'MMM dd yyyy, HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
