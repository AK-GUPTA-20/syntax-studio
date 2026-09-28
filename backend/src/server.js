import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` SYNTAX STUDIO API SERVER STARTED`);
  console.log(` Mode: ${config.nodeEnv}`);
  console.log(` Port: ${PORT}`);
  console.log(` API Base: http://localhost:${PORT}/api`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` Client URL: ${config.clientUrl}`);
  console.log(`===============================================`);
});

// Handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

export default server;
