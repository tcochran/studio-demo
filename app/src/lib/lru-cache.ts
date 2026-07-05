export class LRUCache<K, V> {
	private capacity: number;
	private map: Map<K, V>;

	constructor(capacity: number) {
		if (capacity < 1) {
			throw new Error('Capacity must be at least 1');
		}
		this.capacity = capacity;
		this.map = new Map<K, V>();
	}

	get(key: K): V | undefined {
		if (!this.map.has(key)) {
			return undefined;
		}
		const value = this.map.get(key)!;
		// Move to end (most recently used) by delete + set
		this.map.delete(key);
		this.map.set(key, value);
		return value;
	}

	set(key: K, value: V): void {
		if (this.map.has(key)) {
			this.map.delete(key);
		}
		this.map.set(key, value);
		if (this.map.size > this.capacity) {
			// Delete the least recently used (first key in insertion order)
			const oldestKey = this.map.keys().next().value;
			if (oldestKey !== undefined) {
				this.map.delete(oldestKey);
			}
		}
	}

	get size(): number {
		return this.map.size;
	}
}
