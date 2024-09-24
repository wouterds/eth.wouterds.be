import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { formatDistanceToNowStrict, fromUnixTime } from 'date-fns';
import { useEffect, useMemo } from 'react';

import { getLatestBlock, getNodeInfo } from '~/services/geth-node';
import { hexToAscii } from '~/utils/conversion';

export const meta: MetaFunction = () => {
  return [{ title: 'eth.wouterds.be' }];
};

export const loader = async () => {
  const nodeInfo = await getNodeInfo();
  const block = await getLatestBlock();

  return { block, nodeInfo };
};

export default function Index() {
  const { block, nodeInfo } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  const nodeVersion = useMemo(() => {
    const versionMatch = nodeInfo.name?.match(/^(.+\/v\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : 'Unknown';
  }, [nodeInfo]);

  const nodePlatform = useMemo(() => {
    const platformMatch = nodeInfo.name?.match(/^.+\/v\d+\.\d+\.\d+-[^/]+\/(.+)/);
    return platformMatch ? platformMatch[1] : 'Unknown';
  }, [nodeInfo]);

  const address = useMemo(() => {
    return `${nodeInfo.ip}:${nodeInfo.ports.discovery}`;
  }, [nodeInfo]);

  const difficulty = useMemo(() => {
    return nodeInfo.protocols?.eth?.difficulty;
  }, [nodeInfo]);

  useEffect(() => {
    const interval = setInterval(() => {
      revalidate();
    }, 500);

    return () => clearInterval(interval);
  }, [revalidate]);

  return (
    <div className="flex-1 bg-zinc-900 text-zinc-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-teal-200">eth.wouterds.be</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Node Information blocks */}
        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Version</h2>
          <p className="text-2xl font-bold font-mono">{nodeVersion.split('/')[1]}</p>
          <p className="text-sm text-zinc-400 font-mono">{nodeVersion.split('/')[0]}</p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Platform</h2>
          <p className="text-2xl font-bold font-mono">{nodePlatform.split('/')[1]}</p>
          <p className="text-sm text-zinc-400 font-mono">{nodePlatform.split('/')[0]}</p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Difficulty</h2>
          <p className="text-2xl font-bold font-mono">{difficulty}</p>
          {/* <p className="text-sm text-zinc-400 font-mono">Network difficulty</p> */}
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Address</h2>
          <p className="text-2xl font-bold font-mono">{address.split(':')[0]}</p>
          <p className="text-sm text-zinc-400 font-mono">port {address.split(':')[1]}</p>
        </div>

        {/* Existing blocks */}
        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
            Latest Block
          </h2>
          <p className="text-2xl font-bold font-mono">#{block.number.toLocaleString()}</p>
          <p className="text-sm text-zinc-400 font-mono">
            {formatDistanceToNowStrict(fromUnixTime(block.timestamp), { addSuffix: true })}
          </p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Gas Price</h2>
          <p className="text-2xl font-bold font-mono">
            {(() => {
              const gasUsedGwei = Number(block.baseFeePerGas) / 1e9;
              return gasUsedGwei < 1 ? '< 1 Gwei' : `${gasUsedGwei.toFixed(2)} Gwei`;
            })()}
          </p>
          <p className="text-sm text-zinc-400 font-mono">Base fee per gas</p>
        </div>
      </div>

      <div className="mt-8 bg-zinc-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-teal-200">Block Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-zinc-400">Hash:</p>
            <p className="truncate font-mono">{block.hash}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Parent Hash:</p>
            <p className="truncate font-mono">{block.parentHash}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Transactions:</p>
            <p className="font-mono">{block.transactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Gas Used:</p>
            <p className="font-mono">
              {(() => {
                const gasUsedGwei = Number(block.gasUsed) / 1e9;
                return gasUsedGwei < 1 ? '< 1 Gwei' : `${gasUsedGwei.toFixed(2)} Gwei`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Extra Data:</p>
            <p className="break-all font-mono">{block.extraData}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Decoded Extra Data:</p>
            <p className="break-all font-mono">{hexToAscii(block.extraData) || '--'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
