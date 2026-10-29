import app from './app.js'

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed gracefully.');
    process.exit(0);
  });
});