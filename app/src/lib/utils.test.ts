import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet function', () => {
    it('should return the correct greeting', () => {
        expect(greet('World')).toBe('Hello, World!');
    });
});