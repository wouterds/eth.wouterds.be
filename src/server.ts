import { createRequestHandler } from '@remix-run/express';
import express from 'express';

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
app.use(viteDevServer ? viteDevServer.middlewares : express.static('build/client'));

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
  : // @ts-expect-error this file is generated at build time
    await import('./build/server/index.js');

app.all('*', createRequestHandler({ build }));

app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});
