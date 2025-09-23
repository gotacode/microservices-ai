import { describe, it, expect } from 'vitest';
import {
  mapHeaders,
  mapQueryString,
  parsePayload,
} from '../../../src/handlers/lambda.mapper';

describe('lambda.mapper', () => {
  describe('mapHeaders', () => {
    it('should return empty object for undefined headers', () => {
      expect(mapHeaders(undefined)).toEqual({});
    });

    it('should map headers and lowercase keys', () => {
      const headers = { 'Content-Type': 'application/json', 'X-Custom-Header': 'value' };
      expect(mapHeaders(headers)).toEqual({ 'content-type': 'application/json', 'x-custom-header': 'value' });
    });

    it('should skip undefined header values', () => {
      const headers = { 'Content-Type': 'application/json', 'X-Empty': undefined };
      expect(mapHeaders(headers)).toEqual({ 'content-type': 'application/json' });
    });
  });

  describe('mapQueryString', () => {
    it('should return undefined for no query strings', () => {
      expect(mapQueryString(undefined, undefined)).toBeUndefined();
    });

    it('should handle single-value query strings', () => {
      const qs = { foo: 'bar', baz: 'qux' };
      expect(mapQueryString(qs, undefined)).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('should handle multi-value query strings', () => {
      const mqs = { foo: ['bar', 'baz'] };
      expect(mapQueryString(undefined, mqs)).toEqual({ foo: ['bar', 'baz'] });
    });

    it('should prioritize multi-value over single-value for the same key', () => {
      const qs = { foo: 'bar' };
      const mqs = { foo: ['bar', 'baz'] };
      expect(mapQueryString(qs, mqs)).toEqual({ foo: ['bar', 'baz'] });
    });
  });

  describe('parsePayload', () => {
    it('should return undefined if event body is null', () => {
      const event = { body: null } as any;
      expect(parsePayload(event)).toBeUndefined();
    });

    it('should parse a valid JSON body', () => {
      const payload = { a: 1 };
      const event = { body: JSON.stringify(payload), headers: { 'content-type': 'application/json' } } as any;
      expect(parsePayload(event)).toEqual(payload);
    });

    it('should return raw body if JSON parsing fails but content-type is json', () => {
      const body = '{"a":1';
      const event = { body, headers: { 'content-type': 'application/json' } } as any;
      expect(parsePayload(event)).toEqual(body);
    });

    it('should parse a base64 encoded JSON body', () => {
      const payload = { a: 1 };
      const body = Buffer.from(JSON.stringify(payload)).toString('base64');
      const event = { body, isBase64Encoded: true, headers: { 'content-type': 'application/json' } } as any;
      expect(parsePayload(event)).toEqual(payload);
    });

    it('should return a buffer for base64 encoded non-JSON body', () => {
      const body = Buffer.from('hello').toString('base64');
      const event = { body, isBase64Encoded: true, headers: { 'content-type': 'text/plain' } } as any;
      expect(parsePayload(event)).toBeInstanceOf(Buffer);
      expect((parsePayload(event) as Buffer).toString('utf-8')).toEqual('hello');
    });

    it('should return raw buffer if base64 JSON parsing fails', () => {
      const body = Buffer.from('{"a":1').toString('base64');
      const event = { body, isBase64Encoded: true, headers: { 'content-type': 'application/json' } } as any;
      expect(parsePayload(event)).toBeInstanceOf(Buffer);
    });

    it('should fall back to trying to parse JSON even without content-type', () => {
      const payload = { a: 1 };
      const event = { body: JSON.stringify(payload), headers: {} } as any;
      expect(parsePayload(event)).toEqual(payload);
    });

    it('should fall back to raw body if final JSON parse fails', () => {
      const body = 'just text';
      const event = { body, headers: {} } as any;
      expect(parsePayload(event)).toEqual(body);
    });
  });
});
