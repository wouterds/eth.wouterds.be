import type { MetaFunction } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { format, formatDistanceToNowStrict, fromUnixTime } from 'date-fns';
import { Block, formatUnits } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';
import { useAverage } from '~/hooks/use-average';
import {
  calculateBlockHashrate,
  getLatestBlock,
  getNodeInfo,
  getPeerCount,
  getSyncStatus,
} from '~/services/geth-node';
import { formatHashrate, hexToAscii } from '~/utils/conversion';

export const meta: MetaFunction = () => {
  return [{ title: 'eth.wouterds.be' }];
};

export const loader = async () => {
  const [nodeInfo, block, syncStatus, peerCount] = await Promise.all([
    getNodeInfo(),
    getLatestBlock(),
    getSyncStatus(),
    getPeerCount(),
  ]);

  const hashrate = await calculateBlockHashrate(block.number);

  return json({
    block: JSON.parse(
      JSON.stringify(block, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    ),
    nodeInfo,
    syncStatus,
    peerCount,
    hashrate,
  });
};

export default function Index() {
  const {
    block: initialBlock,
    nodeInfo,
    syncStatus,
    peerCount: peerCountCurrent,
    hashrate: hashrateCurrent,
  } = useLoaderData<typeof loader>();
  const [blocks, setBlocks] = useState<Block[]>([initialBlock]);

  const socket = useSocket();
  const peerCount = useAverage(peerCountCurrent, 10, 0);
  const hashrate = useAverage(hashrateCurrent, 20, 0);

  const addBlock = useCallback(async (block: Block) => {
    setBlocks((blocks) => {
      if (blocks.find((b) => b.number === block.number)) {
        return blocks;
      }

      return [block, ...blocks].slice(0, 100);
    });
  }, []);

  useEffect(() => {
    socket?.on('block', async (id) => {
      const block = await socket.getBlock(id);
      if (block) {
        addBlock(block);
      }
    });
  }, [socket, addBlock]);

  const block = useMemo(() => {
    return blocks[0];
  }, [blocks]);

  const nodeVersion = useMemo(() => {
    const versionMatch = nodeInfo.name?.match(/^(.+\/v\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : 'Unknown';
  }, [nodeInfo]);

  const nodePlatform = useMemo(() => {
    const platformMatch = nodeInfo.name?.match(/^.+\/v\d+\.\d+\.\d+-[^/]+\/(.+)/);
    return platformMatch ? platformMatch[1] : 'Unknown';
  }, [nodeInfo]);

  const address = useMemo(() => {
    return `${nodeInfo.ip}:${nodeInfo.ports.listener}`;
  }, [nodeInfo]);

  const difficulty = useMemo(() => {
    return nodeInfo.protocols?.eth?.difficulty;
  }, [nodeInfo]);

  return (
    <div className="flex-1 bg-zinc-900 text-zinc-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-teal-200">eth.wouterds.be</h1>
      <div className="flex flex-col gap-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Version</h2>
            <p className="text-2xl font-bold font-mono truncate">{nodeVersion}</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Platform</h2>
            <p className="text-2xl font-bold font-mono truncate">{nodePlatform}</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Address</h2>
            <p className="text-2xl font-bold font-mono truncate">{address}</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
              Sync Status
            </h2>
            <p className="text-2xl font-bold font-mono truncate">{syncStatus?.toFixed(2)}%</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
              Peer Count
            </h2>
            <p className="text-2xl font-bold font-mono truncate">{peerCount}</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
              Difficulty
            </h2>
            <p className="text-2xl font-bold font-mono truncate">{difficulty}</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Hashrate</h2>
            <p className="text-2xl font-bold font-mono truncate">{formatHashrate(hashrate)}</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
              Latest Block
            </h2>
            <p className="text-2xl font-bold font-mono truncate">
              #{block.number.toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Gas Used</h2>
            <p className="text-2xl font-bold font-mono truncate">
              {formatUnits(block.gasUsed, 'gwei')}
            </p>
          </div>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200">Block Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400 font-medium">Hash:</p>
              <p className="truncate font-mono">{block.hash}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Parent Hash:</p>
              <p className="truncate font-mono">{block.parentHash}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Miner:</p>
              <p className="break-all font-mono">{block.miner}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Gas Used:</p>
              <p className="font-mono">{formatUnits(block.gasUsed, 'gwei')}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Transactions:</p>
              <p className="font-mono">{block.transactions.length}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Extra Data:</p>
              <p className="break-all font-mono">
                {hexToAscii(block.extraData) || block.extraData}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg flex-1">
          <h2 className="text-xl font-semibold mb-4 text-teal-200">Recent Blocks</h2>
          <div className="overflow-x-auto">
            <table className="max-w-full w-full text-sm text-nowrap">
              <thead>
                <tr className="text-left text-zinc-400">
                  <th className="p-2 font-medium">Block</th>
                  <th className="p-2 font-medium">Hash</th>
                  <th className="p-2 font-medium">Transactions</th>
                  <th className="p-2 font-medium">Gas Used</th>
                  <th className="p-2 font-medium">Extra Data</th>
                  <th className="p-2 font-medium">Age</th>
                  <th className="p-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {blocks
                  .sort((a, b) => b.number - a.number)
                  .map((block) => (
                    <tr key={`block:${block.hash}`} className="border-t border-zinc-700">
                      <td className="p-2 font-mono">#{block.number.toLocaleString()}</td>
                      <td className="p-2 font-mono max-w-96">
                        <div className=" truncate">{block.hash}</div>
                      </td>
                      <td className="p-2 font-mono">{block.transactions.length}</td>
                      <td className="p-2 font-mono">{formatUnits(block.gasUsed, 'gwei')}</td>
                      <td className="p-2 font-mono">
                        {hexToAscii(block.extraData) || block.extraData}
                      </td>
                      <td className="p-2 font-mono">
                        {formatDistanceToNowStrict(fromUnixTime(block.timestamp), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="p-2 font-mono">
                        {format(fromUnixTime(block.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
