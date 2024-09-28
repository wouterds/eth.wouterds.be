import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.GETH_NODE_RPC || 'http://geth:8545');

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
