class LRUNode<K, V> {
	key: K;
	value: V;
	next: LRUNode<K, V> | null = null;
	prev: LRUNode<K, V> | null = null;

	constructor(key: K, value: V) {
		this.key = key;
		this.value = value;
	}
}

export class LRUCache<K, V> {
	private capacity: number;
	private size = 0;
	private map = new Map<K, LRUNode<K, V>>();
	private head: LRUNode<K, V> | null = null;
	private tail: LRUNode<K, V> | null = null;

	constructor(capacity: number) {
		this.capacity = Math.max(0, capacity);
	}

	get(key: K): V | undefined {
		const node = this.map.get(key);
		if (!node) return undefined;

		this.moveToFront(node);
		return node.value;
	}

	set(key: K, value: V): void {
		let node = this.map.get(key);

		if (node) {
			node.value = value;
			this.moveToFront(node);
			return;
		}

		node = new LRUNode(key, value);
		this.map.set(key, node);
		this.addToFront(node);
		this.size++;

		if (this.size > this.capacity) {
			this.evictLRU();
		}
	}

	get sizeInfo(): { size: number; capacity: number } {
		return { size: this.size, capacity: this.capacity };
	}

	get size(): number {
		return this.size;
	}

	private moveToFront(node: LRUNode<K, V>): void {
		if (node === this.head) return;

		this.removeNode(node);
		this.addToFront(node);
	}

	private addToFront(node: LRUNode<K, V>): void {
		node.next = this.head;
		node.prev = null;

		if (this.head) {
			this.head.prev = node;
		}
		this.head = node;

		if (!this.tail) {
			this.tail = node;
		}
	}

	private removeNode(node: LRUNode<K, V>): void {
		if (node.prev) {
			node.prev.next = node.next;
		} else {
			this.head = node.next;
		}

		if (node.next) {
			node.next.prev = node.prev;
		} else {
			this.tail = node.prev;
		}

		node.next = null;
		node.prev = null;
	}

	private evictLRU(): void {
		if (!this.tail) return;

		const key = this.tail.key;
		this.removeNode(this.tail);
		this.map.delete(key);
		this.size--;
	}
}