import { describe, it, expect } from 'vitest';
import { greet } from './greet';

describe('greet', () => {
  it('returns a greeting message', () => {
    expect(greet('World')).toBe('Hello, World');
  });
});