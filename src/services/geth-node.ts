import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('http://geth:8545');

export const getLatestBlock = async () => {
  return provider.getBlock('latest');
};
