import { greet } from './utils';

import { describe, it, expect } from 'vitest';

describe('greet', () => {
  it('should return the correct greeting', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});