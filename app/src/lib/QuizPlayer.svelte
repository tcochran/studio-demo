<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { Pack, QuestionType, TimeMode } from '$lib/packs';

	type PlayableOption = {
		id: string;
		label: string;
		text: string;
	};

	type PlayableQuestion = {
		id: string;
		type: QuestionType;
		prompt: string;
		options: PlayableOption[];
		correctOptionId: string;
		trueFalseAnswer: boolean;
		blankAnswer: string;
		difficulty: number;
		explanation: string;
		points: number;
	};

	type AnswerValue = string | boolean | null;

	type PlayerAnswer = {
		questionId: string;
		type: QuestionType;
		prompt: string;
		answerText: string;
		correctAnswerText: string;
		isCorrect: boolean;
		pointsEarned: number;
		pointsPossible: number;
		timedOut: boolean;
		explanation: string;
	};

	let {
		pack,
		backHref = `${base}/`,
		backLabel = 'Back to packs'
	}: { pack: Pack; backHref?: string; backLabel?: string } = $props();
	const questions = $derived(pack.questions.map(normalizeQuestion));
	const totalPoints = $derived(
		questions.reduce((total, question) => total + question.points, 0)
	);
	const hasTimer = $derived(Boolean(pack.hasTimeLimit && getTimeLimitSeconds() > 0));
	const timeMode = $derived<TimeMode>(pack.timeMode === 'total' ? 'total' : 'per-question');
	const timerModeLabel = $derived(timeMode === 'total' ? 'Quiz timer' : 'Question timer');

	let index = $state(0);
	let selectedOptionId = $state('');
	let trueFalseAnswer = $state<boolean | null>(null);
	let blankAnswer = $state('');
	let submittedAnswer = $state<PlayerAnswer | null>(null);
	let answers = $state<PlayerAnswer[]>([]);
	let finished = $state(false);
	let secondsRemaining = $state(0);
	let timerId: number | null = null;

	const question = $derived(questions[index]);
	const canSubmit = $derived(canSubmitAnswer(question));
	const progressLabel = $derived(
		questions.length > 0
			? `Question ${Math.min(index + 1, questions.length)} of ${questions.length}`
			: 'No questions'
	);
	const progressWidth = $derived(
		questions.length > 0
			? `${Math.min(100, ((index + (submittedAnswer ? 1 : 0)) / questions.length) * 100)}%`
			: '0%'
	);
	const earnedPoints = $derived(
		answers.reduce((total, answer) => total + answer.pointsEarned, 0)
	);
	const correctCount = $derived(answers.filter((answer) => answer.isCorrect).length);
	const incorrectCount = $derived(answers.length - correctCount);
	const scorePercent = $derived(
		totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
	);
	const timerLabel = $derived(formatTimer(secondsRemaining));
	const timerWarning = $derived(hasTimer && secondsRemaining > 0 && secondsRemaining <= 10);

	onMount(() => {
		startRound();

		return () => {
			stopTimer();
		};
	});

	function normalizeQuestion(raw: Pack['questions'][number], fallbackIndex: number): PlayableQuestion {
		const value = raw as Record<string, unknown>;
		const type = getQuestionType(value);
		const options = normalizeOptions(value);
		const correctIndex = Number(value.correctIndex);
		const correctOptionId =
			typeof value.correctOptionId === 'string' &&
			options.some((option) => option.id === value.correctOptionId)
				? value.correctOptionId
				: Number.isInteger(correctIndex) && options[correctIndex]
					? options[correctIndex].id
					: options[0]?.id ?? '';

		return {
			id: typeof value.id === 'string' ? value.id : `question-${fallbackIndex + 1}`,
			type,
			prompt: getPromptText(value),
			options,
			correctOptionId,
			trueFalseAnswer:
				typeof value.trueFalseAnswer === 'boolean' ? value.trueFalseAnswer : true,
			blankAnswer: typeof value.blankAnswer === 'string' ? value.blankAnswer : '',
			difficulty: Number(value.difficulty) || 1,
			explanation: typeof value.explanation === 'string' ? value.explanation : '',
			points: normalizePoints(value.points)
		};
	}

	function getQuestionType(value: Record<string, unknown>): QuestionType {
		if (value.type === 'true-false' || value.type === 'fill-blank' || value.type === 'multiple-choice') {
			return value.type;
		}

		if (typeof value.trueFalseAnswer === 'boolean') return 'true-false';
		if (typeof value.blankAnswer === 'string') return 'fill-blank';

		return 'multiple-choice';
	}

	function getPromptText(value: Record<string, unknown>) {
		const prompt =
			typeof value.prompt === 'string'
				? value.prompt
				: typeof value.promptText === 'string'
					? value.promptText
					: typeof value.promptHtml === 'string'
						? value.promptHtml
						: 'Untitled question';

		return stripHtml(prompt);
	}

	function stripHtml(value: string) {
		return value
			.replace(/<script[\s\S]*?<\/script>/gi, '')
			.replace(/<style[\s\S]*?<\/style>/gi, '')
			.replace(/<br\s*\/?>/gi, ' ')
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function normalizeOptions(value: Record<string, unknown>) {
		if (Array.isArray(value.options)) {
			return value.options
				.filter((option): option is Record<string, unknown> => Boolean(option))
				.map((option, index) => ({
					id: typeof option.id === 'string' ? option.id : `option-${index}`,
					label: getOptionLabel(index),
					text: typeof option.text === 'string' ? option.text : ''
				}))
				.filter((option) => option.text.trim().length > 0);
		}

		if (Array.isArray(value.choices)) {
			return value.choices
				.filter((choice): choice is string => typeof choice === 'string')
				.map((choice, index) => ({
					id: `choice-${index}`,
					label: getOptionLabel(index),
					text: choice
				}));
		}

		return [];
	}

	function normalizePoints(value: unknown) {
		const points = Number(value);
		if (!Number.isFinite(points)) return 1;

		return Math.min(100, Math.max(1, Math.round(points)));
	}

	function getOptionLabel(index: number) {
		return String.fromCharCode(65 + index);
	}

	function getTimeLimitSeconds() {
		const seconds = Number(pack.timeLimitSeconds);
		if (!Number.isFinite(seconds)) return 0;

		return Math.min(10800, Math.max(0, Math.round(seconds)));
	}

	function formatQuestionType(type: QuestionType) {
		if (type === 'true-false') return 'True / false';
		if (type === 'fill-blank') return 'Fill in the blank';

		return 'Multiple choice';
	}

	function formatTimer(totalSeconds: number) {
		const safeSeconds = Math.max(0, Math.floor(totalSeconds));
		const minutes = Math.floor(safeSeconds / 60);
		const seconds = safeSeconds % 60;

		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function normalizeTextAnswer(value: string) {
		return value.trim().replace(/\s+/g, ' ').toLowerCase();
	}

	function canSubmitAnswer(currentQuestion?: PlayableQuestion) {
		if (!currentQuestion || submittedAnswer) return false;

		if (currentQuestion.type === 'multiple-choice') {
			return currentQuestion.options.some((option) => option.id === selectedOptionId);
		}

		if (currentQuestion.type === 'true-false') {
			return trueFalseAnswer !== null;
		}

		return blankAnswer.trim().length > 0;
	}

	function getAnswerValue(currentQuestion: PlayableQuestion): AnswerValue {
		if (currentQuestion.type === 'multiple-choice') return selectedOptionId || null;
		if (currentQuestion.type === 'true-false') return trueFalseAnswer;

		return blankAnswer;
	}

	function getCorrectAnswerText(currentQuestion: PlayableQuestion) {
		if (currentQuestion.type === 'true-false') {
			return currentQuestion.trueFalseAnswer ? 'True' : 'False';
		}

		if (currentQuestion.type === 'fill-blank') {
			return currentQuestion.blankAnswer || 'Accepted answer missing';
		}

		return (
			currentQuestion.options.find((option) => option.id === currentQuestion.correctOptionId)?.text ??
			'Correct answer missing'
		);
	}

	function getAnswerText(currentQuestion: PlayableQuestion, value: AnswerValue, timedOut: boolean) {
		if (timedOut || value === null || value === '') return 'No answer';

		if (currentQuestion.type === 'multiple-choice') {
			return currentQuestion.options.find((option) => option.id === value)?.text ?? 'No answer';
		}

		if (currentQuestion.type === 'true-false') {
			return value ? 'True' : 'False';
		}

		return String(value).trim();
	}

	function isAnswerCorrect(
		currentQuestion: PlayableQuestion,
		value: AnswerValue,
		timedOut: boolean
	) {
		if (timedOut || value === null || value === '') return false;

		if (currentQuestion.type === 'multiple-choice') {
			return value === currentQuestion.correctOptionId;
		}

		if (currentQuestion.type === 'true-false') {
			return value === currentQuestion.trueFalseAnswer;
		}

		return (
			normalizeTextAnswer(String(value)) === normalizeTextAnswer(currentQuestion.blankAnswer)
		);
	}

	function createAnswer(
		currentQuestion: PlayableQuestion,
		value: AnswerValue,
		timedOut = false
	): PlayerAnswer {
		const isCorrect = isAnswerCorrect(currentQuestion, value, timedOut);

		return {
			questionId: currentQuestion.id,
			type: currentQuestion.type,
			prompt: currentQuestion.prompt,
			answerText: getAnswerText(currentQuestion, value, timedOut),
			correctAnswerText: getCorrectAnswerText(currentQuestion),
			isCorrect,
			pointsEarned: isCorrect ? currentQuestion.points : 0,
			pointsPossible: currentQuestion.points,
			timedOut,
			explanation: currentQuestion.explanation
		};
	}

	function startRound() {
		stopTimer();
		answers = [];
		finished = false;
		prepareQuestion(0);

		if (hasTimer && timeMode === 'total') {
			startTimer(getTimeLimitSeconds());
		}
	}

	function prepareQuestion(nextIndex: number) {
		index = nextIndex;
		selectedOptionId = '';
		trueFalseAnswer = null;
		blankAnswer = '';
		submittedAnswer = null;

		if (hasTimer && timeMode === 'per-question') {
			startTimer(getTimeLimitSeconds());
		}
	}

	function startTimer(seconds: number) {
		stopTimer();
		secondsRemaining = seconds;

		if (!browser || seconds <= 0) return;

		timerId = window.setInterval(() => {
			secondsRemaining = Math.max(0, secondsRemaining - 1);
			if (secondsRemaining <= 0) {
				handleTimerExpired();
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerId !== null && browser) {
			window.clearInterval(timerId);
		}
		timerId = null;
	}

	function handleTimerExpired() {
		if (finished || !question) return;

		if (timeMode === 'total') {
			if (!submittedAnswer) {
				submitAnswer(true);
			}
			finishRound();
			return;
		}

		if (!submittedAnswer) {
			submitAnswer(true);
		}
	}

	function selectOption(optionId: string) {
		if (submittedAnswer) return;
		selectedOptionId = optionId;
	}

	function setBooleanAnswer(answer: boolean) {
		if (submittedAnswer) return;
		trueFalseAnswer = answer;
	}

	function submitAnswer(timedOut = false) {
		if (!question || submittedAnswer) return;
		if (!timedOut && !canSubmit) return;

		const answer = createAnswer(
			question,
			timedOut ? null : getAnswerValue(question),
			timedOut
		);

		submittedAnswer = answer;
		answers = [...answers, answer];

		if (!hasTimer || timeMode === 'per-question') {
			stopTimer();
		}
	}

	function continueRound() {
		if (!submittedAnswer) {
			submitAnswer();
			return;
		}

		if (index + 1 >= questions.length) {
			finishRound();
			return;
		}

		prepareQuestion(index + 1);
	}

	function finishRound() {
		const answeredQuestionIds = new Set(answers.map((answer) => answer.questionId));
		const unansweredAnswers = questions
			.filter((currentQuestion) => !answeredQuestionIds.has(currentQuestion.id))
			.map((currentQuestion) => createAnswer(currentQuestion, null, true));

		if (unansweredAnswers.length > 0) {
			answers = [...answers, ...unansweredAnswers];
		}

		finished = true;
		stopTimer();
	}
</script>

<div class="container">
	{#if questions.length === 0}
		<div class="empty-card">
			<a class="back-link" href={backHref}>{backLabel}</a>
			<h1>{pack.title}</h1>
			<p>This quiz does not have any playable questions yet.</p>
		</div>
	{:else if !finished && question}
		<div class="player-shell">
			<div class="top-row">
				<a class="back-link" href={backHref}>{backLabel}</a>
				<div class="top-meta">
					<span>{progressLabel}</span>
					{#if hasTimer}
						<span class:warning={timerWarning} class="timer-pill" aria-live="polite">
							{timerModeLabel} {timerLabel}
						</span>
					{/if}
				</div>
			</div>

			<div class="progress-track" aria-hidden="true">
				<span style={`width: ${progressWidth};`}></span>
			</div>

			{#key question.id}
				<article class="question-card">
					<div class="pack-kicker">
						<span>{pack.category}</span>
						<span>{formatQuestionType(question.type)}</span>
						<span>{question.points} {question.points === 1 ? 'point' : 'points'}</span>
					</div>

					<h1>{pack.title}</h1>
					<p class="prompt">{question.prompt}</p>

					{#if question.type === 'multiple-choice'}
						<div class="choice-list">
							{#each question.options as option (option.id)}
								{@const isSelected = selectedOptionId === option.id}
								{@const showCorrect =
									!!submittedAnswer && option.id === question.correctOptionId}
								{@const showWrong =
									!!submittedAnswer && isSelected && option.id !== question.correctOptionId}
								<button
									type="button"
									class="choice"
									class:selected={isSelected}
									class:correct={showCorrect}
									class:wrong={showWrong}
									disabled={!!submittedAnswer}
									onclick={() => selectOption(option.id)}
								>
									<span class="letter">{option.label}</span>
									<span>{option.text}</span>
								</button>
							{/each}
						</div>
					{:else if question.type === 'true-false'}
						<div class="boolean-grid">
							<button
								type="button"
								class:selected={trueFalseAnswer === true}
								class:correct={!!submittedAnswer && question.trueFalseAnswer}
								class:wrong={!!submittedAnswer && trueFalseAnswer === true && !question.trueFalseAnswer}
								disabled={!!submittedAnswer}
								onclick={() => setBooleanAnswer(true)}
							>
								True
							</button>
							<button
								type="button"
								class:selected={trueFalseAnswer === false}
								class:correct={!!submittedAnswer && !question.trueFalseAnswer}
								class:wrong={!!submittedAnswer && trueFalseAnswer === false && question.trueFalseAnswer}
								disabled={!!submittedAnswer}
								onclick={() => setBooleanAnswer(false)}
							>
								False
							</button>
						</div>
					{:else}
						<label class="blank-answer">
							<span>Your answer</span>
							<input
								type="text"
								placeholder="Type your answer"
								bind:value={blankAnswer}
								disabled={!!submittedAnswer}
							/>
						</label>
					{/if}

					{#if submittedAnswer}
						<div
							class="feedback"
							class:correct={submittedAnswer.isCorrect}
							class:wrong={!submittedAnswer.isCorrect}
							aria-live="polite"
						>
							<strong>
								{#if submittedAnswer.timedOut}
									Time expired.
								{:else if submittedAnswer.isCorrect}
									Correct.
								{:else}
									Not quite.
								{/if}
							</strong>
							<span>Correct answer: {submittedAnswer.correctAnswerText}</span>
							{#if question.explanation}
								<p>{question.explanation}</p>
							{/if}
						</div>
					{/if}

					<div class="action-row">
						<button
							type="button"
							class="primary-button"
							disabled={!submittedAnswer && !canSubmit}
							onclick={continueRound}
						>
							{#if submittedAnswer}
								{index + 1 >= questions.length ? 'See score' : 'Next question'}
							{:else}
								Submit answer
							{/if}
						</button>
					</div>
				</article>
			{/key}
		</div>
	{:else}
		<div class="result-card">
			<div class="result-hero">
				<a class="back-link" href={backHref}>{backLabel}</a>
				<p class="result-label">You scored</p>
				<p class="result-score">{scorePercent}%</p>
				<p class="result-points">
					{earnedPoints} of {totalPoints} points - {correctCount} of {questions.length} correct
				</p>
				<p class="result-summary">
					{#if scorePercent === 100}
						Perfect round. Nicely played.
					{:else if scorePercent >= 70}
						Strong showing. One more pass and this one is yours.
					{:else if scorePercent >= 40}
						Not bad. The explanations should help on the replay.
					{:else}
						Rough round. Reset and give it another run.
					{/if}
				</p>
			</div>

			<div class="result-stats" aria-label="Score summary">
				<div>
					<span>Correct</span>
					<strong>{correctCount}</strong>
				</div>
				<div>
					<span>Missed</span>
					<strong>{incorrectCount}</strong>
				</div>
				<div>
					<span>Points</span>
					<strong>{earnedPoints}/{totalPoints}</strong>
				</div>
			</div>

			<div class="result-actions">
				<button type="button" class="primary-button" onclick={startRound}>Play again</button>
				<a class="secondary-button" href={backHref}>Pick another pack</a>
			</div>

			<section class="review-section" aria-labelledby="review-title">
				<div class="review-heading">
					<div>
						<p class="result-label">Answer review</p>
						<h2 id="review-title">Review every question</h2>
					</div>
				</div>

				<ol class="review-list">
					{#each answers as answer, reviewIndex (answer.questionId)}
						<li class:correct={answer.isCorrect} class:wrong={!answer.isCorrect}>
							<div class="review-item-heading">
								<span>{reviewIndex + 1}</span>
								<div>
									<strong>{answer.prompt}</strong>
									<small>{formatQuestionType(answer.type)}</small>
								</div>
							</div>

							<div class="review-grid">
								<div>
									<span>Your answer</span>
									<strong>{answer.answerText}</strong>
								</div>
								<div>
									<span>Correct answer</span>
									<strong>{answer.correctAnswerText}</strong>
								</div>
								<div>
									<span>Score</span>
									<strong>
										{answer.pointsEarned}/{answer.pointsPossible}
										{answer.pointsPossible === 1 ? 'point' : 'points'}
									</strong>
								</div>
							</div>

							{#if answer.explanation}
								<p class="review-explanation">{answer.explanation}</p>
							{/if}
						</li>
					{/each}
				</ol>
			</section>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 760px;
		margin: 0 auto;
		padding: 1rem 1.25rem 3rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #141414;
	}

	.player-shell {
		display: grid;
		gap: 1rem;
	}

	.top-row,
	.top-meta,
	.pack-kicker,
	.action-row,
	.result-actions,
	.review-item-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.top-row {
		margin-top: 0.25rem;
	}

	.back-link {
		color: #1d4ed8;
		font-size: 0.9rem;
		font-weight: 750;
		text-decoration: none;
	}

	.back-link:hover {
		color: #0f766e;
	}

	.top-meta {
		justify-content: flex-end;
		color: #666;
		font-size: 0.86rem;
		font-weight: 750;
	}

	.timer-pill {
		border: 1px solid #b7e4dc;
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		padding: 0.42rem 0.7rem;
		white-space: nowrap;
	}

	.timer-pill.warning {
		border-color: #fed7aa;
		background: #fff7ed;
		color: #c2410c;
	}

	.progress-track {
		overflow: hidden;
		height: 0.55rem;
		border-radius: 999px;
		background: #e5e7eb;
	}

	.progress-track span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: #1d4ed8;
		transition: width 160ms ease;
	}

	.question-card,
	.result-card,
	.empty-card {
		border: 1px solid #dedede;
		border-radius: 8px;
		background: #fff;
		padding: 1.5rem;
		box-shadow: 0 12px 30px rgba(20, 20, 20, 0.05);
	}

	.question-card {
		display: grid;
		gap: 1.25rem;
		animation: enter-question 180ms ease both;
	}

	.pack-kicker {
		justify-content: flex-start;
		flex-wrap: wrap;
		color: #666;
		font-size: 0.78rem;
		font-weight: 850;
		text-transform: uppercase;
	}

	.pack-kicker span {
		border-radius: 999px;
		background: #f3f4f6;
		padding: 0.35rem 0.55rem;
	}

	h1,
	h2,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0;
		color: #666;
		font-size: 0.95rem;
		font-weight: 850;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	h2 {
		margin-bottom: 0;
		font-size: 1.2rem;
		line-height: 1.25;
		letter-spacing: 0;
	}

	.prompt {
		margin-bottom: 0;
		color: #111;
		font-size: 1.45rem;
		font-weight: 850;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.choice-list {
		display: grid;
		gap: 0.7rem;
	}

	.choice,
	.boolean-grid button,
	.primary-button,
	.secondary-button {
		min-height: 2.8rem;
		border-radius: 8px;
		font: inherit;
		font-weight: 750;
		cursor: pointer;
		transition:
			background 120ms ease,
			border-color 120ms ease,
			color 120ms ease,
			transform 120ms ease;
	}

	.choice,
	.boolean-grid button {
		border: 1.5px solid #d9d9d9;
		background: #fff;
		color: #222;
	}

	.choice {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.9rem 1rem;
		text-align: left;
	}

	.choice:hover:not(:disabled),
	.boolean-grid button:hover:not(:disabled) {
		border-color: #1d4ed8;
	}

	.choice:disabled,
	.boolean-grid button:disabled {
		cursor: default;
	}

	.choice.selected,
	.boolean-grid button.selected {
		border-color: #1d4ed8;
		background: #f4f7fb;
		color: #1741b6;
	}

	.choice.correct,
	.boolean-grid button.correct {
		border-color: #16a34a;
		background: #f0fdf4;
		color: #14532d;
	}

	.choice.wrong,
	.boolean-grid button.wrong {
		border-color: #dc2626;
		background: #fef2f2;
		color: #7f1d1d;
	}

	.letter {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 6px;
		background: #eef2ff;
		color: #1d4ed8;
		font-size: 0.8rem;
		font-weight: 850;
	}

	.choice.correct .letter {
		background: #16a34a;
		color: #fff;
	}

	.choice.wrong .letter {
		background: #dc2626;
		color: #fff;
	}

	.boolean-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.blank-answer {
		display: grid;
		gap: 0.45rem;
		max-width: 32rem;
	}

	.blank-answer span {
		color: #333;
		font-size: 0.86rem;
		font-weight: 750;
	}

	.blank-answer input {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #cfcfcf;
		border-radius: 8px;
		background: #fff;
		padding: 0.85rem;
		font: inherit;
		outline: none;
	}

	.blank-answer input:focus {
		border-color: #1d4ed8;
		box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.13);
	}

	.feedback {
		display: grid;
		gap: 0.35rem;
		border-left: 3px solid #d1d5db;
		background: #f8fafc;
		padding: 0.9rem 1rem;
		line-height: 1.45;
	}

	.feedback.correct {
		border-color: #16a34a;
		background: #f0fdf4;
		color: #14532d;
	}

	.feedback.wrong {
		border-color: #dc2626;
		background: #fef2f2;
		color: #7f1d1d;
	}

	.feedback p {
		margin-bottom: 0;
	}

	.action-row,
	.result-actions {
		justify-content: flex-start;
		flex-wrap: wrap;
	}

	.primary-button,
	.secondary-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid transparent;
		padding: 0.75rem 1rem;
		text-decoration: none;
	}

	.primary-button {
		background: #1d4ed8;
		color: #fff;
	}

	.primary-button:hover:not(:disabled) {
		background: #1741b6;
		transform: translateY(-1px);
	}

	.primary-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.secondary-button {
		border-color: #cfcfcf;
		background: #fff;
		color: #222;
	}

	.secondary-button:hover {
		border-color: #1d4ed8;
		color: #1d4ed8;
	}

	.result-card,
	.empty-card {
		display: grid;
		gap: 1rem;
		margin-top: 1rem;
	}

	.empty-card {
		text-align: center;
		justify-items: center;
	}

	.result-card {
		justify-items: stretch;
	}

	.result-hero {
		display: grid;
		gap: 0.9rem;
		justify-items: center;
		text-align: center;
	}

	.result-label {
		margin-bottom: -0.25rem;
		color: #666;
		font-size: 0.82rem;
		font-weight: 850;
		text-transform: uppercase;
	}

	.result-score {
		margin-bottom: 0;
		color: #1d4ed8;
		font-size: 4rem;
		font-weight: 850;
		line-height: 1;
	}

	.result-points {
		margin-bottom: 0;
		color: #333;
		font-weight: 800;
	}

	.result-summary,
	.empty-card p {
		max-width: 38ch;
		margin-bottom: 0;
		color: #555;
		line-height: 1.5;
	}

	.result-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		border-top: 1px solid #ececec;
		border-bottom: 1px solid #ececec;
		padding: 1rem 0;
	}

	.result-stats div,
	.review-grid div {
		display: grid;
		gap: 0.2rem;
	}

	.result-stats span,
	.review-grid span,
	.review-item-heading small {
		color: #666;
		font-size: 0.76rem;
		font-weight: 850;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.result-stats strong {
		font-size: 1.2rem;
		line-height: 1.2;
	}

	.review-section {
		display: grid;
		gap: 1rem;
		margin-top: 0.5rem;
		border-top: 1px solid #ececec;
		padding-top: 1.25rem;
		text-align: left;
	}

	.review-list {
		display: grid;
		gap: 0.85rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.review-list li {
		display: grid;
		gap: 0.85rem;
		border-left: 3px solid #d1d5db;
		background: #f8fafc;
		padding: 1rem;
	}

	.review-list li.correct {
		border-color: #16a34a;
	}

	.review-list li.wrong {
		border-color: #dc2626;
	}

	.review-item-heading {
		align-items: flex-start;
		justify-content: flex-start;
	}

	.review-item-heading > span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		font-size: 0.82rem;
		font-weight: 850;
	}

	.review-item-heading div {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}

	.review-item-heading strong {
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.review-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.review-grid strong,
	.review-explanation {
		overflow-wrap: anywhere;
	}

	.review-explanation {
		margin-bottom: 0;
		color: #555;
		line-height: 1.5;
	}

	@keyframes enter-question {
		from {
			opacity: 0;
			transform: translateY(0.4rem);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 620px) {
		.container {
			padding: 0.85rem 1rem 2rem;
		}

		.top-row,
		.top-meta,
		.action-row,
		.result-actions,
		.review-item-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.question-card,
		.result-card,
		.empty-card {
			padding: 1.1rem;
		}

		.prompt {
			font-size: 1.2rem;
		}

		.boolean-grid {
			grid-template-columns: 1fr;
		}

		.result-stats,
		.review-grid {
			grid-template-columns: 1fr;
		}

		.primary-button,
		.secondary-button {
			width: 100%;
		}

		.result-score {
			font-size: 3rem;
		}
	}
</style>
