export const formatBlockNumber = (blockNumber: number) => {
  return blockNumber?.toLocaleString('en-US') || blockNumber;
};
