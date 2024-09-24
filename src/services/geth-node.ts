import { ethers } from 'ethers';

const GET_NODE = process.env.GETH_NODE || 'http://geth:8545';

const provider = new ethers.JsonRpcProvider(GET_NODE);

export const getLatestBlock = async () => {
  return provider.getBlock('latest');
};

export const getNetwork = async () => {
  return provider.getNetwork();
};

export const getNodeInfo = async () => {
  return provider.send('admin_nodeInfo', []);
};
