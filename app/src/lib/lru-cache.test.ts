import { describe, it, expect } from 'vitest';
import { LRUCache } from './lru-cache';

describe('LRUCache', () => {
	it('stores and retrieves a value', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		expect(cache.get('a')).toBe(1);
	});

	it('returns undefined for a missing key', () => {
		const cache = new LRUCache<string, number>(3);
		expect(cache.get('missing')).toBeUndefined();
	});

	it('evicts the least-recently-used entry when over capacity', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		// 'a' is LRU — adding 'd' should evict it
		cache.set('d', 4);
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBe(2);
		expect(cache.get('c')).toBe(3);
		expect(cache.get('d')).toBe(4);
	});

	it('get counts as a use, promoting the key above LRU', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		// touch 'a' so 'b' becomes LRU
		cache.get('a');
		cache.set('d', 4);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('a')).toBe(1);
		expect(cache.get('c')).toBe(3);
		expect(cache.get('d')).toBe(4);
	});

	it('set on an existing key updates the value and promotes it', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		// re-set 'a' with a new value — 'b' should now be LRU
		cache.set('a', 99);
		cache.set('d', 4);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('a')).toBe(99);
	});

	it('respects capacity limit of 1', () => {
		const cache = new LRUCache<string, number>(1);
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBe(2);
	});

	it('handles eviction order across multiple accesses', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		cache.get('a'); // order: b, c, a (b is LRU)
		cache.get('b'); // order: c, a, b (c is LRU)
		cache.set('d', 4); // evicts 'c'
		expect(cache.get('c')).toBeUndefined();
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBe(2);
		expect(cache.get('d')).toBe(4);
	});
});
