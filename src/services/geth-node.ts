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
