
import { describe, it, expect, vi } from 'vitest';
import { mapHeaders, mapQueryString, parsePayload } from '../../../src/handlers/lambda.mapper';

// Mock the logger
vi.mock('../../../src/logger', () => ({
  default: { warn: vi.fn() },
}));

describe('Lambda Mapper', () => {
  describe('mapHeaders', () => {
    it('should return an empty object if headers are undefined', () => {
      expect(mapHeaders(undefined)).toEqual({});
    });

    it('should map headers to lowercase and filter out undefined values', () => {
      const headers = {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'my-value',
        'Undefined-Header': undefined,
      };
      expect(mapHeaders(headers)).toEqual({
        'content-type': 'application/json',
        'x-custom-header': 'my-value',
      });
    });
  });

  describe('mapQueryString', () => {
    it('should return undefined if no query params are provided', () => {
      expect(mapQueryString(undefined, undefined)).toBeUndefined();
    });

    it('should handle single-value query parameters', () => {
      const single = { a: '1', b: '2' };
      expect(mapQueryString(single, undefined)).toEqual({ a: '1', b: '2' });
    });

    it('should handle multi-value query parameters', () => {
      const multi = { a: ['1', '2'], c: ['3'] };
      expect(mapQueryString(undefined, multi)).toEqual({ a: ['1', '2'], c: ['3'] });
    });

    it('should merge single and multi-value, prioritizing multi-value', () => {
      const single = { a: 'should-be-ignored', b: '2' };
      const multi = { a: ['1', '2'], c: ['3'] };
      expect(mapQueryString(single, multi)).toEqual({ a: ['1', '2'], b: '2', c: ['3'] });
    });
  });

  describe('parsePayload', () => {
    it('should return undefined for an event with no body', () => {
      const event = { headers: {} } as any;
      expect(parsePayload(event)).toBeUndefined();
    });

    it('should return the raw body for non-JSON content', () => {
      const event = { body: 'plain text', headers: {} } as any;
      expect(parsePayload(event)).toBe('plain text');
    });

    it('should parse a valid JSON body', () => {
      const event = { body: '{"a":1}', headers: { 'Content-Type': 'application/json' } } as any;
      expect(parsePayload(event)).toEqual({ a: 1 });
    });

    it('should fall back to raw body for invalid JSON', () => {
      const event = { body: 'not-json', headers: { 'Content-Type': 'application/json' } } as any;
      expect(parsePayload(event)).toBe('not-json');
    });

    it('should parse a base64-encoded JSON body', () => {
      const body = JSON.stringify({ a: 1 });
      const event = {
        body: Buffer.from(body).toString('base64'),
        isBase64Encoded: true,
        headers: { 'content-type': 'application/json' },
      } as any;
      expect(parsePayload(event)).toEqual({ a: 1 });
    });

    it('should return a buffer for base64-encoded non-JSON content', () => {
      const event = {
        body: Buffer.from('hello').toString('base64'),
        isBase64Encoded: true,
        headers: { 'content-type': 'text/plain' },
      } as any;
      const result = parsePayload(event);
      expect(result).toBeInstanceOf(Buffer);
      expect((result as Buffer).toString('utf-8')).toBe('hello');
    });
  });
});
