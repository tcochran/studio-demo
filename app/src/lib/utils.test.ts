import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
  it('returns the correct greeting', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});