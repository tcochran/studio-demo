import { describe, it, expect } from 'vitest';
import { LRUCache } from './LRUCache';

describe('LRUCache', () => {
	it('should set and get values', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		expect(cache.get('a')).toBe(1);
	});

	it('should return undefined for missing key', () => {
		const cache = new LRUCache<string, number>(2);
		expect(cache.get('missing')).toBeUndefined();
	});

	it('should evict least recently used when capacity exceeded', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3); // should evict 'a'
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBe(2);
		expect(cache.get('c')).toBe(3);
	});

	it('should update existing key', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('a', 2);
		expect(cache.get('a')).toBe(2);
	});

	it('should maintain LRU order when getting existing key', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.get('a'); // 'a' becomes most recently used
		cache.set('c', 3); // should evict 'b', not 'a'
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('should respect capacity limits', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		cache.set('d', 4); // should evict 'a'
		expect(cache.get('a')).toBeUndefined();
		expect(cache.size).toBe(3);
	});

	it('should handle zero capacity', () => {
		const cache = new LRUCache<string, number>(0);
		cache.set('a', 1);
		expect(cache.get('a')).toBeUndefined();
	});

	it('should handle negative capacity', () => {
		const cache = new LRUCache<string, number>(-1);
		cache.set('a', 1);
		expect(cache.get('a')).toBeUndefined();
	});
});