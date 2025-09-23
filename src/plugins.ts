import { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import { getRedisClient } from './plugins/redisClient';
import config from './config';

export const registerPlugins = (app: FastifyInstance) => {
  const { http: httpConfig } = config;

  if (httpConfig.cors.enabled) {
    app.register(cors, {
      origin: httpConfig.cors.origin,
      methods: httpConfig.cors.methods,
      credentials: httpConfig.cors.allowCredentials,
    });
  }

  if (httpConfig.security.enabled) {
    app.register(helmet, { global: true });
  }

  if (httpConfig.compression.enabled) {
    app.register(compress, {
      global: true,
      encodings: ['br', 'gzip'],
      threshold: httpConfig.compression.minLength,
    });
  }

  app.register(jwt, {
    secret: config.auth.jwtSecret,
    verify: {
      audience: config.auth.jwtAudience,
      issuer: config.auth.jwtIssuer,
    },
  });

  const redis = getRedisClient();
  app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowSeconds * 1000, // plugin expects milliseconds
    redis: redis,
    keyGenerator: (request: any) => (request.ip || request.socket?.remoteAddress || 'anonymous') as string,
  });
};
