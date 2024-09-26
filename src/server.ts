import { createRequestHandler } from '@remix-run/express';
import express from 'express';

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

const app = express();
app.use(viteDevServer?.middlewares || express.static('./client'));

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
  : // @ts-expect-error this file is generated at build time
    await import('./server/index.js');

app.all('*', createRequestHandler({ build }));

app.listen(Number(PORT), HOST, () => {
  console.log(`App listening on http://${HOST}:${PORT}`);
});
