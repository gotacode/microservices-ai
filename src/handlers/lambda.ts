import { server as prodServer } from '../index';
import type { FastifyInstance } from 'fastify';
import type { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import logger from '../logger';
import { mapHeaders, mapQueryString, parsePayload } from './lambda.mapper';

export const createHandler = (server: FastifyInstance) => {
  const ready = server.ready();

  return async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    await ready;

    logger.debug({ path: event.path, method: event.httpMethod }, 'lambda handler invoked');

    const response = await server.inject({
      method: event.httpMethod,
      url: event.path ?? '/',
      query: mapQueryString(event.queryStringParameters ?? undefined, event.multiValueQueryStringParameters ?? undefined),
      payload: parsePayload(event),
      headers: mapHeaders(event.headers),
    });

    return {
      statusCode: response.statusCode,
      body: response.body,
      headers: response.headers as Record<string, string>,
    };
  };
};

export const handler = createHandler(prodServer);