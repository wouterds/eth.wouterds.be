import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import { getLatestBlock } from '~/services/geth-node';

export const meta: MetaFunction = () => {
  return [{ title: 'eth.wouterds.be' }];
};

export const loader = async () => {
  const block = await getLatestBlock();

  return { block };
};

export default function Index() {
  const { block } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const interval = setInterval(() => {
      revalidate();
    }, 10000);

    return () => clearInterval(interval);
  }, [revalidate]);

  return (
    <div className="bg-zinc-900 text-teal-100 p-24 pb-32 flex-1 flex items-center justify-center">
      last block: {block.number}
    </div>
  );
}
