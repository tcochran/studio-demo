export class LRUCache<K, V> {
	private capacity: number;
	private cache: Map<K, V>;
	private order: K[];

	constructor(capacity: number) {
		this.capacity = capacity;
		this.cache = new Map();
		this.order = [];
	}

	get(key: K): V | undefined {
		if (!this.cache.has(key)) {
			return undefined;
		}
		// Mark as recently used
		const index = this.order.indexOf(key);
		if (index !== -1) {
			this.order.splice(index, 1);
		}
		this.order.push(key);
		return this.cache.get(key);
	}

	set(key: K, value: V): void {
		// If key already exists, remove it from order tracking
		if (this.cache.has(key)) {
			const index = this.order.indexOf(key);
			if (index !== -1) {
				this.order.splice(index, 1);
			}
		} else if (this.cache.size >= this.capacity) {
			// Evict least recently used item
			const lruKey = this.order.shift();
			if (lruKey !== undefined) {
				this.cache.delete(lruKey);
			}
		}

		// Add the new item
		this.cache.set(key, value);
		this.order.push(key);
	}
}
