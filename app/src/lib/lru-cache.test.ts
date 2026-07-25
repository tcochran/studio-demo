import { describe, it, expect } from 'vitest';
import { LRUCache } from './lru-cache';

describe('LRUCache', () => {
	it('stores and retrieves values', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		expect(cache.get('a')).toBe(1);
	});

	it('returns undefined for missing keys', () => {
		const cache = new LRUCache<string, number>(2);
		expect(cache.get('missing')).toBeUndefined();
	});

	it('evicts least-recently-used item when over capacity', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		// 'a' should be evicted as least recently used
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBe(2);
		expect(cache.get('c')).toBe(3);
	});

	it('marks items as recently used on get', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		// Access 'a', making it recently used
		cache.get('a');
		// Add 'c', should evict 'b' (now least recently used)
		cache.set('c', 3);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('updates existing key and marks it as recently used', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		// Update 'a' with new value
		cache.set('a', 10);
		// Add 'c', should evict 'b' (now least recently used)
		cache.set('c', 3);
		expect(cache.get('a')).toBe(10);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('respects capacity limit', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBe(2);
		expect(cache.get('c')).toBe(3);
		// All three should still be in cache
		cache.set('d', 4);
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBe(2);
		expect(cache.get('c')).toBe(3);
		expect(cache.get('d')).toBe(4);
	});

	it('works with different key/value types', () => {
		const cache = new LRUCache<number, string>(2);
		cache.set(1, 'one');
		cache.set(2, 'two');
		expect(cache.get(1)).toBe('one');
		expect(cache.get(2)).toBe('two');
	});
});
