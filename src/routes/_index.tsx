import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { formatDistanceToNowStrict, fromUnixTime } from 'date-fns';
import { useEffect } from 'react';

import { getLatestBlock } from '~/services/geth-node';

export const meta: MetaFunction = () => {
  return [{ title: 'eth.wouterds.be' }];
};

export const loader = async () => {
  const block = await getLatestBlock();

  return { block };
};

export default function Index() {
  const { block } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const interval = setInterval(() => {
      revalidate();
    }, 200);

    return () => clearInterval(interval);
  }, [revalidate]);

  return (
    <div className="flex-1 bg-zinc-900 text-zinc-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-teal-200">eth.wouterds.be</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
            Node Status
          </h2>
          <p className="text-2xl font-bold">Active</p>
          <p className="text-sm text-zinc-400">Uptime: 7d 3h 45m</p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Network</h2>
          <p className="text-2xl font-bold">Mainnet</p>
          <p className="text-sm text-zinc-400">Chain ID: 1</p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
            Latest Block
          </h2>
          <p className="text-2xl font-bold">#{block.number.toLocaleString()}</p>
          <p className="text-sm text-zinc-400">
            {formatDistanceToNowStrict(fromUnixTime(block.timestamp), { addSuffix: true })}
          </p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Peer Count</h2>
          <p className="text-2xl font-bold">67</p>
          <p className="text-sm text-zinc-400">Connected peers</p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Gas Price</h2>
          <p className="text-2xl font-bold">{block.baseFeePerGas} Gwei</p>
          <p className="text-sm text-zinc-400">Base fee per gas</p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
            Sync Status
          </h2>
          <p className="text-2xl font-bold">100%</p>
          <p className="text-sm text-zinc-400">Fully synced</p>
        </div>
      </div>

      <div className="mt-8 bg-zinc-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-teal-200">Block Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-zinc-400">Hash:</p>
            <p className="truncate">{block.hash}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Parent Hash:</p>
            <p className="truncate">{block.parentHash}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Transactions:</p>
            <p>{block.transactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Gas Used:</p>
            <p>{block.gasUsed.toLocaleString()} wei</p>
          </div>
        </div>
      </div>
    </div>
  );
}
