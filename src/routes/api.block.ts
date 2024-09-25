import { json, LoaderFunctionArgs } from '@remix-run/node';

import { getBlockByNumber } from '~/services/geth-node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const block = await getBlockByNumber(Number(url.searchParams.get('block')));
  if (!block) {
    return json({ block: null }, { status: 404 });
  }

  return json({ block });
};
