import pino from 'pino';
import config from './config';

const logger = pino({
  level: config.logging.level,
  name: config.appName,
  // Conditionally add the transport for pretty printing
  transport: config.logging.pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export default logger;
