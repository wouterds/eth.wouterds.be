import { ethers } from 'ethers';

const GET_NODE = process.env.GETH_NODE || 'http://geth:8545';

const provider = new ethers.JsonRpcProvider(GET_NODE);

export const getLatestBlock = async () => {
  return getBlock('latest', { withTransactions: true });
};

export const getBlock = async (
  blockNumber: number | 'latest',
  options?: { withTransactions: boolean },
) => {
  const block = await provider.getBlock(blockNumber, true);
  if (!block) {
    throw new Error('Block not found');
  }

  if (options?.withTransactions) {
    const transactions = await Promise.all(
      block.transactions.map(async (tx) => provider.getTransactionReceipt(tx)),
    );

    return {
      ...block,
      transactions,
    };
  }

  return block;
};

export const getNetwork = async () => {
  return provider.getNetwork();
};

export const getNodeInfo = async () => {
  return provider.send('admin_nodeInfo', []);
};

export const getSyncStatus = async (): Promise<number | null> => {
  const syncStatus = await provider.send('eth_syncing', []);

  if (syncStatus === false) {
    return 100;
  }

  if (typeof syncStatus === 'object' && syncStatus !== null) {
    const currentBlock = BigInt(syncStatus.currentBlock);
    const highestBlock = BigInt(syncStatus.highestBlock);

    if (highestBlock > 0n) {
      const percentage = Number((currentBlock * 1000000n) / highestBlock) / 10000;
      return Math.min(99.9999, percentage);
    }
  }

  return 0;
};

export const getPeerCount = async (): Promise<number> => {
  const peerCount = await provider.send('net_peerCount', []);
  return parseInt(peerCount, 16);
};

export const calculateBlockHashrate = async (blockNumber: number): Promise<number> => {
  const block = await provider.getBlock(blockNumber);
  const previousBlock = await provider.getBlock(blockNumber - 1);

  if (!block || !previousBlock) {
    throw new Error('Block not found');
  }

  const difficulty = BigInt(block.difficulty);
  const timeElapsed = block.timestamp - previousBlock.timestamp;

  if (timeElapsed <= 0) {
    return 0; // Avoid division by zero or negative time
  }

  // Calculate hashrate: difficulty / time (in seconds)
  const hashrate = difficulty / BigInt(timeElapsed);

  return Number(hashrate);
};
