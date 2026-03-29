<script lang="ts">
	let count: number = $state(0);

	function increment(): void {
		count += 1;
	}
</script>

<main>
	<h1>Hello World!</h1>
	<p>Welcome to your first Svelte app.</p>
	<button onclick={increment}>
		Clicked {count} {count === 1 ? 'time' : 'times'}
	</button>
</main>

<style>
	main {
		font-family: system-ui, -apple-system, sans-serif;
		text-align: center;
		padding: 2rem;
		max-width: 600px;
		margin: 0 auto;
	}

	h1 {
		color: #2563eb;
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	p {
		color: #555;
		font-size: 1.2rem;
		margin-bottom: 2rem;
	}

	button {
		background-color: #2563eb;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		font-size: 1.1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover {
		background-color: #1d4ed8;
	}
</style>
