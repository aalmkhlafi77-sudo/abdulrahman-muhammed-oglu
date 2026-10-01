import { app } from '../server';

const port = Number(process.env.PORT || 3000);
const { createServer: createViteServer } = await import('vite');
const vite = await createViteServer({
  server: { middlewareMode: true, host: '0.0.0.0', port },
  appType: 'spa',
});

app.use(vite.middlewares);
app.listen(port, '0.0.0.0', () => {
  console.log(`Portfolio development server running on http://0.0.0.0:${port}`);
});
