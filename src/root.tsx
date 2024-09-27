import './tailwind.css';

import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, useLoaderData } from '@remix-run/react';
import { ethers, WebSocketProvider } from 'ethers';
import { ReactNode, useEffect, useState } from 'react';

import { SocketProvider } from '~/context';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        {/* <ScrollRestoration /> */}
        <Scripts />
      </body>
    </html>
  );
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  if (process.env.GETH_NODE_WS) {
    return { node: process.env.GETH_NODE_WS };
  }

  return { node: `wss://${new URL(request.url).host}/ws` };
};

const App = () => {
  const { node } = useLoaderData<typeof loader>();
  const [socket, setSocket] = useState<WebSocketProvider | null>(null);

  useEffect(() => {
    const socket = new ethers.WebSocketProvider(node);
    setSocket(socket);

    return () => {
      socket.destroy();
    };
  }, [node]);

  return (
    <SocketProvider socket={socket}>
      <Outlet />
    </SocketProvider>
  );
};

export default App;
