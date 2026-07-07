import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
  it('returns greeting with name', () => {
    expect(greet('World')).toBe('Hello, World!');
    expect(greet('Alice')).toBe('Hello, Alice!');
    expect(greet('Bob')).toBe('Hello, Bob!');
  });
});