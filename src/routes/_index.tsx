import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [{ title: 'eth.wouterds.be' }];
};

export default function Index() {
  return (
    <div className="bg-zinc-900 text-teal-100 p-24 pb-32 flex-1 flex items-center justify-center">
      eth.wouterds.be
    </div>
  );
}
