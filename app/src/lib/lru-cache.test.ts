import { describe, it, expect } from 'vitest';
import { LRUCache } from './lru-cache';

describe('LRUCache', () => {
	it('returns undefined for a missing key', () => {
		const cache = new LRUCache<string, number>(3);
		expect(cache.get('a')).toBeUndefined();
	});

	it('returns a value that was set', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		expect(cache.get('a')).toBe(1);
	});

	it('evicts the least-recently-used item when over capacity', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3); // should evict 'a'
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBe(2);
		expect(cache.get('c')).toBe(3);
	});

	it('evicts in LRU order — get counts as a use', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		// access 'a' to make it most recently used
		cache.get('a');
		cache.set('c', 3); // should evict 'b' (least recently used)
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('updating an existing key does not increase size and marks it as recently used', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('a', 99); // update 'a', capacity still 2
		cache.set('c', 3); // should evict 'b' since 'a' was just updated
		expect(cache.get('a')).toBe(99);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('respects capacity of 1', () => {
		const cache = new LRUCache<string, number>(1);
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBe(2);
	});

	it('works with non-string keys', () => {
		const cache = new LRUCache<number, string>(2);
		cache.set(1, 'one');
		cache.set(2, 'two');
		cache.set(3, 'three');
		expect(cache.get(1)).toBeUndefined();
		expect(cache.get(2)).toBe('two');
		expect(cache.get(3)).toBe('three');
	});
});
