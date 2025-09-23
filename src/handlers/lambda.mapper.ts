import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventMultiValueQueryStringParameters,
} from 'aws-lambda';
import logger from '../logger';

export const mapHeaders = (headers?: APIGatewayProxyEventHeaders) => {
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

export const mapQueryString = (
  single?: Record<string, string | undefined>,
  multi?: APIGatewayProxyEventMultiValueQueryStringParameters,
) => {
  if (!single && !multi) {
    return undefined;
  }
  const query: Record<string, string | string[]> = {};
  if (multi) {
    for (const [key, values] of Object.entries(multi)) {
      if (values !== undefined) {
        query[key] = values;
      }
    }
  }
  if (single) {
    for (const [key, value] of Object.entries(single)) {
      // Only process single values if the key does not already exist from multi-values
      if (value !== undefined && !query[key]) {
        query[key] = value;
      }
    }
  }
  return Object.keys(query).length > 0 ? query : undefined;
};

export const parsePayload = (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    return undefined;
  }

  const headers = mapHeaders(event.headers);
  const contentType = headers['content-type'];

  if (event.isBase64Encoded) {
    const buffer = Buffer.from(event.body, 'base64');
    if (contentType && contentType.includes('application/json')) {
      try {
        return JSON.parse(buffer.toString('utf-8'));
      } catch (error) {
        logger.warn({ err: error }, 'failed to parse base64 JSON payload, returning raw buffer');
      }
    }
    return buffer;
  }

  if (contentType && contentType.includes('application/json')) {
    try {
      return JSON.parse(event.body);
    } catch (error) {
      logger.warn({ err: error }, 'failed to parse JSON payload, falling back to raw body');
    }
  }

  try {
    return JSON.parse(event.body);
  } catch {
    return event.body;
  }
};
