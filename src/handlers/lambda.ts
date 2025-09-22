import { server } from '../index';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

// A minimal adapter to run Fastify inside AWS Lambda (API Gateway v2)
export const handler = async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
  // Reuse the server across invocations to improve cold start
  await server.ready();

  // Allow Fastify to handle the request by creating a raw Node request/response might be heavy;
  // for now return a simple health for demonstration.
  if (event.path === '/health') {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  return {
    statusCode: 501,
    body: JSON.stringify({ error: 'Not implemented in lambda adapter yet' }),
    headers: { 'Content-Type': 'application/json' },
  };
};
