<script lang="ts">
	import QuizPlayer from '$lib/QuizPlayer.svelte';
	import type { Pack } from '$lib/packs';

	let { data } = $props();
	const pack = $derived<Pack>(data.pack);
</script>

<QuizPlayer {pack} />
