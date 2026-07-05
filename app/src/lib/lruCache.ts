export class LRUCache<K, V> {
	private readonly capacity: number;
	private readonly entries = new Map<K, V>();

	constructor(capacity: number) {
		if (!Number.isInteger(capacity) || capacity <= 0) {
			throw new Error('LRUCache capacity must be a positive integer');
		}
		this.capacity = capacity;
	}

	get size(): number {
		return this.entries.size;
	}

	get(key: K): V | undefined {
		if (!this.entries.has(key)) return undefined;
		const value = this.entries.get(key) as V;
		this.entries.delete(key);
		this.entries.set(key, value);
		return value;
	}

	set(key: K, value: V): void {
		if (this.entries.has(key)) {
			this.entries.delete(key);
		}
		this.entries.set(key, value);
		if (this.entries.size > this.capacity) {
			const oldest = this.entries.keys().next().value as K;
			this.entries.delete(oldest);
		}
	}
}
