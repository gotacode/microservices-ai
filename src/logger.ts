import pino, { type Logger } from 'pino';
import config from './config';

let transport: pino.TransportSingleOptions | undefined;
if (config.logging.pretty) {
  try {
    require.resolve('pino-pretty');
    transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  } catch {
    // pino-pretty not available; fall back to JSON logs
    transport = undefined;
  }
}

const logger: Logger = pino({
  level: config.logging.level,
  name: config.appName,
  transport,
});

export const setLoggerLevel = (level: string) => {
  logger.level = level;
};

export default logger;
