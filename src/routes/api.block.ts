import { json, LoaderFunctionArgs } from '@remix-run/node';

import { getBlock } from '~/services/geth-node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const block = await getBlock(Number(url.searchParams.get('block')));
  if (!block) {
    return json({ block: null }, { status: 404 });
  }

  return json({ block });
};
