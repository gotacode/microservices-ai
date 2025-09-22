import { server } from '../index';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult, APIGatewayProxyEventHeaders } from 'aws-lambda';
import logger from '../logger';

// Adapt AWS API Gateway event to Fastify using server.inject
type ProxyResponse = APIGatewayProxyResult;

const mapHeaders = (headers?: APIGatewayProxyEventHeaders) => {
  if (!headers) {
    return {};
  }
  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      mapped[key.toLowerCase()] = value;
    }
  }
  return mapped;
};

export const handler = async (event: APIGatewayProxyEvent, _context: Context): Promise<ProxyResponse> => {
  await server.ready();

  logger.debug({ path: event.path, method: event.httpMethod }, 'lambda handler invoked');

  const response = await server.inject({
    method: event.httpMethod,
    url: event.path ?? '/',
    query: event.queryStringParameters ?? undefined,
    payload: event.body ? JSON.parse(event.body) : undefined,
    headers: mapHeaders(event.headers),
  });

  return {
    statusCode: response.statusCode,
    body: response.body,
    headers: response.headers as Record<string, string>,
  };
};
