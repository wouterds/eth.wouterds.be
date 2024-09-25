import type { MetaFunction } from '@remix-run/node';
import { json, useLoaderData, useRevalidator } from '@remix-run/react';
import { usePrevious } from '@uidotdev/usehooks';
import { format, formatDistanceToNowStrict, fromUnixTime } from 'date-fns';
import { Block, formatUnits } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getLatestBlock, getNodeInfo } from '~/services/geth-node';
import { hexToAscii } from '~/utils/conversion';

export const meta: MetaFunction = () => {
  return [{ title: 'eth.wouterds.be' }];
};

export const loader = async () => {
  const [nodeInfo, block] = await Promise.all([getNodeInfo(), getLatestBlock()]);

  return json({ block, nodeInfo });
};

export default function Index() {
  const { block, nodeInfo } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const [blocks, setBlocks] = useState<Block[]>([block]);

  const addBlock = useCallback(async (block: Block) => {
    setBlocks((blocks) => {
      if (blocks.find((b) => b.number === block.number)) {
        return blocks;
      }

      return [block, ...blocks].slice(0, 1000);
    });
  }, []);

  useEffect(() => {
    addBlock(block);
  }, [addBlock, block]);

  const previousBlock = usePrevious(block);
  useEffect(() => {
    if (previousBlock) {
      const diff = block.number - previousBlock.number;

      for (let i = 1; i <= diff; i++) {
        fetch(`/api/block?block=${previousBlock.number + i}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((data) => addBlock(data.block));
      }
    }
  }, [addBlock, block, previousBlock]);

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

  const sortedBlocks = useMemo(() => {
    const sorted = blocks.sort((a, b) => b.number - a.number);
    if (sorted.length > 1 && sorted[0].number - sorted[1].number > 1) {
      return sorted.slice(1);
    }

    return sorted;
  }, [blocks]);

  return (
    <div className="flex-1 bg-zinc-900 text-zinc-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-teal-200">eth.wouterds.be</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Version</h2>
          <p className="text-2xl font-bold font-mono">{nodeVersion.split('/')[1]}</p>
          <p className="text-sm text-zinc-400 font-medium font-mono">{nodeVersion.split('/')[0]}</p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Platform</h2>
          <p className="text-2xl font-bold font-mono">{nodePlatform.split('/')[1]}</p>
          <p className="text-sm text-zinc-400 font-medium font-mono">
            {nodePlatform.split('/')[0]}
          </p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Difficulty</h2>
          <p className="text-2xl font-bold font-mono">{difficulty}</p>
          {/* <p className="text-sm text-zinc-400 font-medium font-mono">Network difficulty</p> */}
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Address</h2>
          <p className="text-2xl font-bold font-mono">{address.split(':')[0]}</p>
          <p className="text-sm text-zinc-400 font-medium font-mono">
            port {address.split(':')[1]}
          </p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">
            Latest Block
          </h2>
          <p className="text-2xl font-bold font-mono">#{block.number.toLocaleString()}</p>
          <p className="text-sm text-zinc-400 font-medium font-mono">
            {formatDistanceToNowStrict(fromUnixTime(block.timestamp), { addSuffix: true })}
          </p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-200 flex items-center">Gas Price</h2>
          <p className="text-2xl font-bold font-mono"></p>
          <p className="text-sm text-zinc-400 font-medium font-mono">Base fee per gas</p>
        </div>
      </div>

      <div className="mt-8 bg-zinc-800 p-6 rounded-lg shadow-lg">
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
            <p className="break-all font-mono">{hexToAscii(block.extraData) || block.extraData}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-zinc-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-teal-200">Recent Blocks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400">
                <th className="pb-2 font-medium">Number</th>
                <th className="pb-2 font-medium">Hash</th>
                <th className="pb-2 font-medium">Miner</th>
                <th className="pb-2 font-medium">Gas Used</th>
                <th className="pb-2 font-medium">Transactions</th>
                <th className="pb-2 font-medium">Extra Data</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedBlocks.map((block) => (
                <tr key={block.hash} className="border-t border-zinc-700">
                  <td className="py-2 font-mono">#{block.number.toLocaleString()}</td>
                  <td className="py-2 font-mono truncate">{block.hash}</td>
                  <td className="py-2 font-mono">{block.miner}</td>
                  <td className="py-2 font-mono">{formatUnits(block.gasUsed, 'gwei')}</td>
                  <td className="py-2 font-mono">{block.transactions.length}</td>
                  <td className="py-2 font-mono">
                    {hexToAscii(block.extraData) || block.extraData}
                  </td>
                  <td className="py-2 font-mono">
                    {format(fromUnixTime(block.timestamp), 'yyyy-MM-dd HH:mm:ss')}
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
