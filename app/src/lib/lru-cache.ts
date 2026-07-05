export class LRUCache<K, V> {
	private readonly capacity: number;
	private readonly map: Map<K, V>;

	constructor(capacity: number) {
		this.capacity = capacity;
		this.map = new Map();
	}

	get(key: K): V | undefined {
		if (!this.map.has(key)) return undefined;
		const value = this.map.get(key)!;
		this.map.delete(key);
		this.map.set(key, value);
		return value;
	}

	set(key: K, value: V): void {
		if (this.map.has(key)) {
			this.map.delete(key);
		} else if (this.map.size >= this.capacity) {
			this.map.delete(this.map.keys().next().value!);
		}
		this.map.set(key, value);
	}
}
