import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
  it('should return a greeting with the name', () => {
    expect(greet('Alice')).toBe('Hello, Alice!');
  });

  it('should handle empty name', () => {
    expect(greet('')).toBe('Hello, !');
  });
});