import 'dotenv/config';

import { createRequestHandler } from '@remix-run/express';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? null
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
  : // @ts-expect-error this file is generated at build time
    await import('./server/index.js');

const server = express();
server.use(compression());
server.use(morgan('tiny'));
server.use(express.static('./client'));

server.all('*', createRequestHandler({ build }));

server.listen(Number(PORT), HOST, () => {
  console.log(`⚡ Ready on http://${HOST}:${PORT}`);
});
