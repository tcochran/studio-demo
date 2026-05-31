<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import QuizPlayer from '$lib/QuizPlayer.svelte';
	import type { Pack, Question, TimeMode } from '$lib/packs';

	let pack = $state<Pack | null>(null);
	let ready = $state(false);
	let errorMessage = $state('');

	onMount(() => {
		if (!browser) return;

		try {
			const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
			const token = params.get('quiz');
			if (!token) {
				errorMessage = 'This share link is missing quiz data.';
				return;
			}

			const decodedPack = normalizeSharedPack(decodeShareToken(token));
			if (!decodedPack) {
				errorMessage = 'This share link could not be read.';
				return;
			}

			pack = decodedPack;
		} catch {
			errorMessage = 'This share link could not be read.';
		} finally {
			ready = true;
		}
	});

	function decodeShareToken(token: string) {
		const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
		const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
		const binary = atob(normalized + padding);
		const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
		const json = new TextDecoder().decode(bytes);

		return JSON.parse(json) as unknown;
	}

	function normalizeSharedPack(value: unknown): Pack | null {
		if (!value || typeof value !== 'object') return null;

		const packValue = value as Record<string, unknown>;
		const questions = Array.isArray(packValue.questions)
			? packValue.questions
					.map((question, index) => normalizeSharedQuestion(question, index))
					.filter((question): question is Question => Boolean(question))
			: [];

		if (questions.length === 0) return null;

		return {
			id: typeof packValue.id === 'string' ? packValue.id : 'shared-quiz',
			title: typeof packValue.title === 'string' ? packValue.title : 'Shared quiz',
			category: typeof packValue.category === 'string' ? packValue.category : 'General',
			description: typeof packValue.description === 'string' ? packValue.description : '',
			hasTimeLimit: typeof packValue.hasTimeLimit === 'boolean' ? packValue.hasTimeLimit : false,
			timeLimitSeconds: normalizeSeconds(packValue.timeLimitSeconds),
			timeMode: normalizeTimeMode(packValue.timeMode),
			questions
		};
	}

	function normalizeSharedQuestion(value: unknown, index: number): Question | null {
		if (!value || typeof value !== 'object') return null;

		const question = value as Record<string, unknown>;
		const type =
			question.type === 'true-false' || question.type === 'fill-blank'
				? question.type
				: 'multiple-choice';
		const baseQuestion = {
			id: typeof question.id === 'string' ? question.id : `question-${index + 1}`,
			prompt: typeof question.prompt === 'string' ? question.prompt : 'Untitled question',
			difficulty: normalizeDifficulty(question.difficulty),
			explanation: typeof question.explanation === 'string' ? question.explanation : '',
			points: normalizePoints(question.points)
		};

		if (type === 'true-false') {
			return {
				...baseQuestion,
				type,
				trueFalseAnswer:
					typeof question.trueFalseAnswer === 'boolean' ? question.trueFalseAnswer : true
			};
		}

		if (type === 'fill-blank') {
			return {
				...baseQuestion,
				type,
				blankAnswer: typeof question.blankAnswer === 'string' ? question.blankAnswer : ''
			};
		}

		const options = Array.isArray(question.options)
			? question.options
					.filter((option): option is Record<string, unknown> => Boolean(option))
					.map((option, optionIndex) => ({
						id: typeof option.id === 'string' ? option.id : `option-${optionIndex}`,
						text: typeof option.text === 'string' ? option.text : ''
					}))
					.filter((option) => option.text.trim().length > 0)
			: [];

		if (options.length < 2) return null;

		return {
			...baseQuestion,
			type: 'multiple-choice',
			options,
			correctOptionId:
				typeof question.correctOptionId === 'string' ? question.correctOptionId : options[0].id
		};
	}

	function normalizeSeconds(value: unknown) {
		const seconds = Number(value);
		if (!Number.isFinite(seconds)) return 0;

		return Math.min(10800, Math.max(0, Math.round(seconds)));
	}

	function normalizePoints(value: unknown) {
		const points = Number(value);
		if (!Number.isFinite(points)) return 1;

		return Math.min(100, Math.max(1, Math.round(points)));
	}

	function normalizeDifficulty(value: unknown): 1 | 2 | 3 {
		const difficulty = Number(value);
		if (difficulty === 2 || difficulty === 3) return difficulty;

		return 1;
	}

	function normalizeTimeMode(value: unknown): TimeMode {
		return value === 'total' ? 'total' : 'per-question';
	}
</script>

{#if pack}
	<QuizPlayer {pack} backHref={`${base}/`} backLabel="Back to packs" />
{:else}
	<div class="container">
		<div class="share-card">
			<a class="back-link" href="{base}/">Back to packs</a>
			<p class="eyebrow">Shared quiz</p>
			<h1>{ready ? 'Link unavailable' : 'Loading quiz'}</h1>
			<p>{ready ? errorMessage : 'Opening the shared quiz.'}</p>
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 720px;
		margin: 0 auto;
		padding: 1.25rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #141414;
	}

	.share-card {
		display: grid;
		gap: 0.8rem;
		border: 1px solid #dedede;
		border-radius: 8px;
		background: #fff;
		padding: 1.5rem;
		box-shadow: 0 12px 30px rgba(20, 20, 20, 0.05);
	}

	.back-link {
		width: fit-content;
		color: #1d4ed8;
		font-size: 0.9rem;
		font-weight: 750;
		text-decoration: none;
	}

	.back-link:hover {
		color: #0f766e;
	}

	.eyebrow {
		margin: 0;
		color: #0f766e;
		font-size: 0.74rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	h1,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0;
		font-size: 2rem;
		line-height: 1.1;
		letter-spacing: 0;
	}

	p:last-child {
		margin-bottom: 0;
		color: #555;
		line-height: 1.5;
	}
</style>
