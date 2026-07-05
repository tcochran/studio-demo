import { describe, it, expect } from 'vitest';
import { LRUCache } from './lruCache';

describe('LRUCache', () => {
	it('stores and retrieves values', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('missing')).toBeUndefined();
	});

	it('reports its size', () => {
		const cache = new LRUCache<string, number>(3);
		expect(cache.size).toBe(0);
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.size).toBe(2);
	});

	it('rejects a non-positive capacity', () => {
		expect(() => new LRUCache<string, number>(0)).toThrow();
		expect(() => new LRUCache<string, number>(-1)).toThrow();
	});

	it('never exceeds its capacity', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		expect(cache.size).toBe(2);
	});

	it('evicts the least recently used entry when over capacity', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBe(2);
		expect(cache.get('c')).toBe(3);
	});

	it('counts a get as a use, protecting the entry from eviction', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.get('a')).toBe(1);
		cache.set('c', 3);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('counts a set as a use, refreshing an existing key', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('a', 10);
		cache.set('c', 3);
		expect(cache.get('a')).toBe(10);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('updates the value of an existing key without growing size', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('a', 2);
		expect(cache.size).toBe(1);
		expect(cache.get('a')).toBe(2);
	});
});
