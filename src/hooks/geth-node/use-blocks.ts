import { Block } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSocket } from '~/context';

export const useBlocks = (initialData?: Block[] | null, options?: { limit?: number }) => {
  const limit = options?.limit || 100;
  const socket = useSocket();
  const [blocks, setBlocks] = useState<Block[]>(initialData || []);
  const block = useMemo(() => blocks[0], [blocks]);

  const addBlock = useCallback(
    async (block: Block) => {
      setBlocks((blocks) => {
        if (blocks.find((b) => b.number === block.number)) {
          return blocks;
        }

        return [block, ...blocks].slice(0, limit);
      });
    },
    [limit],
  );

  useEffect(() => {
    socket?.on('block', (id) => {
      socket.getBlock(id).then((block) => addBlock(block!));
    });
  }, [socket, addBlock]);

  return useMemo(() => ({ blocks, block }), [blocks, block]);
};
