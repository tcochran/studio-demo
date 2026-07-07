import { describe, it, expect } from 'vitest';

import { greet } from './utils';

describe('greet function', () => {
  it('should return Hello, <name>!', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});