import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.GETH_NODE_RPC || 'http://geth:8545');

export const getLatestBlocks = async (limit: number) => {
  const latestBlockNumber = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latestBlockNumber - limit + 1);

  const blocks = await Promise.all(
    Array.from({ length: limit }, (_, i) => latestBlockNumber - i)
      .filter((blockNumber) => blockNumber >= fromBlock)
      .map(getBlock),
  );

  return blocks.filter(Boolean);
};

export const getBlock = async (blockNumber: number | 'latest') => {
  const block = await provider.getBlock(blockNumber, true);
  if (!block) {
    return null;
  }

  return block;
};
