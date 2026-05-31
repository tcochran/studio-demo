<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	const categories = [
		'General',
		'Sports',
		'History',
		'Science',
		'Entertainment',
		'Music',
		'Movies',
		'Food & Drink'
	];
	const difficulties = ['Easy', 'Medium', 'Hard'] as const;
	const timeModes = [
		{ value: 'per-question', label: 'Per question' },
		{ value: 'total', label: 'Total quiz' }
	] as const;
	const questionTypes = [
		{ value: 'multiple-choice', label: 'Multiple choice' },
		{ value: 'true-false', label: 'True / false' },
		{ value: 'fill-blank', label: 'Fill in the blank' }
	] as const;
	const draftKey = 'quiz-lab-setup-draft';
	const minMultipleChoiceOptions = 2;
	const maxMultipleChoiceOptions = 6;

	type Difficulty = (typeof difficulties)[number];
	type TimeMode = (typeof timeModes)[number]['value'];
	type QuestionType = (typeof questionTypes)[number]['value'];

	type QuizDraft = {
		title: string;
		description: string;
		category: string;
		difficulty: Difficulty;
		hasTimeLimit: boolean;
		timeLimitSeconds: number;
		timeMode: TimeMode;
		updatedAt: string;
	};

	type QuestionOption = {
		id: string;
		text: string;
	};

	type QuestionDraft = {
		type: QuestionType;
		promptHtml: string;
		options: QuestionOption[];
		correctOptionId: string;
		trueFalseAnswer: boolean;
		blankAnswer: string;
		explanation: string;
		points: number;
	};

	type SavedQuestion = QuestionDraft & {
		id: string;
		promptText: string;
	};

	type StoredQuestionBuilder = {
		current?: Partial<QuestionDraft>;
		questions?: Partial<SavedQuestion>[];
	};

	type StoredQuizDraft = Partial<QuizDraft> & {
		timeLimitMinutes?: unknown;
		quizStatus?: QuizStatus;
		lastManualSaveAt?: string;
		questionBuilder?: StoredQuestionBuilder;
	};

	type QuizStatus = 'draft' | 'published';
	type FeedbackTone = 'neutral' | 'success' | 'error';
	type MoveDirection = 'up' | 'down';
	type PreviewStatus = 'idle' | 'playing' | 'results';
	type PreviewAnswerValue = string | boolean | null;
	type PreviewAnswer = {
		questionId: string;
		type: QuestionType;
		promptText: string;
		answerText: string;
		correctAnswerText: string;
		isCorrect: boolean;
		pointsEarned: number;
		pointsPossible: number;
		timedOut: boolean;
		explanation: string;
	};
	type SharedQuestion = {
		id: string;
		type: QuestionType;
		prompt: string;
		difficulty: 1 | 2 | 3;
		explanation: string;
		points: number;
		options?: QuestionOption[];
		correctOptionId?: string;
		trueFalseAnswer?: boolean;
		blankAnswer?: string;
	};
	type SharedQuizPayload = {
		id: string;
		title: string;
		category: string;
		description: string;
		hasTimeLimit: boolean;
		timeLimitSeconds: number;
		timeMode: TimeMode;
		questions: SharedQuestion[];
	};

	let draft = $state<QuizDraft>(createDefaultDraft());
	let questionDraft = $state<QuestionDraft>(createQuestionDraft());
	let savedQuestions = $state<SavedQuestion[]>([]);
	let editingQuestionId = $state<string | null>(null);
	let draggingQuestionId = $state<string | null>(null);
	let dragOverQuestionId = $state<string | null>(null);
	let quizStatus = $state<QuizStatus>('draft');
	let lastManualSaveAt = $state('');
	let managementFeedback = $state('');
	let managementFeedbackTone = $state<FeedbackTone>('neutral');
	let attemptedSubmit = $state(false);
	let attemptedQuestionSave = $state(false);
	let draftReady = $state(false);
	let builderReady = $state(false);
	let saveState = $state<'idle' | 'loaded' | 'saved'>('idle');
	let promptEditor = $state<HTMLDivElement | null>(null);
	let previewPanel = $state<HTMLElement | null>(null);
	let previewStatus = $state<PreviewStatus>('idle');
	let previewIndex = $state(0);
	let previewSelectedOptionId = $state('');
	let previewTrueFalseAnswer = $state<boolean | null>(null);
	let previewBlankAnswer = $state('');
	let previewSubmittedAnswer = $state<PreviewAnswer | null>(null);
	let previewAnswers = $state<PreviewAnswer[]>([]);
	let previewSecondsRemaining = $state(0);
	let previewStartedAt = $state('');
	let previewTimerId: number | null = null;

	const titleError = $derived(
		draft.title.trim().length >= 3 ? '' : 'Use at least 3 characters for the title.'
	);
	const timeError = $derived(
		draft.hasTimeLimit &&
			(!Number.isFinite(draft.timeLimitSeconds) ||
				draft.timeLimitSeconds < 1 ||
				draft.timeLimitSeconds > 10800)
			? 'Choose a time limit from 1 to 10,800 seconds.'
			: ''
	);
	const isValid = $derived(!titleError && !timeError);
	const saveLabel = $derived(
		saveState === 'loaded'
			? 'Draft restored'
			: saveState === 'saved'
				? 'Draft saved'
				: 'Draft autosaves'
	);
	const timeSummary = $derived(
		draft.hasTimeLimit
			? `${formatSeconds(draft.timeLimitSeconds)} ${draft.timeMode === 'per-question' ? 'per question' : 'total'}`
			: 'No time limit'
	);
	const promptText = $derived(getPlainText(questionDraft.promptHtml));
	const isMultipleChoiceQuestion = $derived(questionDraft.type === 'multiple-choice');
	const isTrueFalseQuestion = $derived(questionDraft.type === 'true-false');
	const isFillBlankQuestion = $derived(questionDraft.type === 'fill-blank');
	const questionErrors = $derived(getQuestionErrors());
	const canSaveQuestion = $derived(questionErrors.length === 0);
	const correctAnswerPreview = $derived(getCorrectAnswerPreview(questionDraft));
	const savedQuestionCountLabel = $derived(
		`${savedQuestions.length} ${savedQuestions.length === 1 ? 'question' : 'questions'}`
	);
	const totalPoints = $derived(
		savedQuestions.reduce((total, question) => total + normalizePoints(question.points), 0)
	);
	const quizStatusLabel = $derived(quizStatus === 'published' ? 'Published' : 'Draft');
	const lastManualSaveLabel = $derived(
		lastManualSaveAt ? `Saved ${formatTimestamp(lastManualSaveAt)}` : 'No manual save yet'
	);
	const publishBlockReason = $derived(
		!isValid
			? 'Resolve setup errors before publishing.'
			: savedQuestions.length === 0
				? 'Add at least one question before publishing.'
				: ''
	);
	const saveQuestionLabel = $derived(editingQuestionId ? 'Update question' : 'Save question');
	const previewQuestion = $derived(savedQuestions[previewIndex]);
	const isPreviewActive = $derived(previewStatus !== 'idle');
	const previewBlockReason = $derived(getPreviewBlockReason());
	const previewCanSubmit = $derived(canSubmitPreviewAnswer(previewQuestion));
	const previewIsLastQuestion = $derived(previewIndex + 1 >= savedQuestions.length);
	const previewProgressLabel = $derived(
		savedQuestions.length > 0
			? `Question ${Math.min(previewIndex + 1, savedQuestions.length)} of ${savedQuestions.length}`
			: 'No questions'
	);
	const previewProgressWidth = $derived(
		savedQuestions.length > 0
			? `${Math.min(100, ((previewIndex + (previewSubmittedAnswer ? 1 : 0)) / savedQuestions.length) * 100)}%`
			: '0%'
	);
	const previewEarnedPoints = $derived(
		previewAnswers.reduce((total, answer) => total + answer.pointsEarned, 0)
	);
	const previewCorrectCount = $derived(
		previewAnswers.filter((answer) => answer.isCorrect).length
	);
	const previewScorePercent = $derived(
		totalPoints > 0 ? Math.round((previewEarnedPoints / totalPoints) * 100) : 0
	);
	const previewTimerLabel = $derived(formatTimer(previewSecondsRemaining));
	const previewTimerWarning = $derived(
		draft.hasTimeLimit && previewSecondsRemaining > 0 && previewSecondsRemaining <= 10
	);
	const shareLink = $derived(createShareLink());
	const canShareQuiz = $derived(quizStatus === 'published' && !publishBlockReason);
	const shareStatusLabel = $derived(
		canShareQuiz ? 'Ready to share' : 'Publish this quiz to generate a public link.'
	);
	const draftSnapshot = $derived({
		title: draft.title,
		description: draft.description,
		category: draft.category,
		difficulty: draft.difficulty,
		hasTimeLimit: draft.hasTimeLimit,
		timeLimitSeconds: draft.timeLimitSeconds,
		timeMode: draft.timeMode
	});
	const questionSnapshot = $derived({
		current: serializeQuestionDraft(questionDraft),
		questions: savedQuestions.map(serializeSavedQuestion)
	});

	function createDefaultDraft(): QuizDraft {
		return {
			title: '',
			description: '',
			category: 'General',
			difficulty: 'Medium',
			hasTimeLimit: false,
			timeLimitSeconds: 30,
			timeMode: 'per-question',
			updatedAt: ''
		};
	}

	function createId(prefix: string) {
		return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	}

	function createOption(text = ''): QuestionOption {
		return {
			id: createId('option'),
			text
		};
	}

	function createQuestionDraft(type: QuestionType = 'multiple-choice'): QuestionDraft {
		const options = [createOption(), createOption()];

		return {
			type,
			promptHtml: '',
			options,
			correctOptionId: options[0].id,
			trueFalseAnswer: true,
			blankAnswer: '',
			explanation: '',
			points: 1
		};
	}

	function formatSeconds(seconds: number) {
		return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
	}

	function isQuestionType(value: unknown): value is QuestionType {
		return questionTypes.some((type) => type.value === value);
	}

	function normalizePoints(value: unknown) {
		const points = Number(value);
		if (!Number.isFinite(points)) return 1;

		return Math.min(100, Math.max(1, Math.round(points)));
	}

	function normalizeOptions(value: unknown): QuestionOption[] {
		const options = Array.isArray(value)
			? value
					.filter((option): option is Partial<QuestionOption> => Boolean(option))
					.slice(0, maxMultipleChoiceOptions)
					.map((option) => ({
						id: typeof option.id === 'string' ? option.id : createId('option'),
						text: typeof option.text === 'string' ? option.text : ''
					}))
			: [];

		while (options.length < minMultipleChoiceOptions) {
			options.push(createOption());
		}

		return options;
	}

	function normalizeQuestionDraft(value?: Partial<QuestionDraft>): QuestionDraft {
		const type = isQuestionType(value?.type) ? value.type : 'multiple-choice';
		const options = normalizeOptions(value?.options);
		const correctOptionId = options.some((option) => option.id === value?.correctOptionId)
			? (value?.correctOptionId as string)
			: options[0].id;

		return {
			type,
			promptHtml: typeof value?.promptHtml === 'string' ? value.promptHtml : '',
			options,
			correctOptionId,
			trueFalseAnswer:
				typeof value?.trueFalseAnswer === 'boolean' ? value.trueFalseAnswer : true,
			blankAnswer: typeof value?.blankAnswer === 'string' ? value.blankAnswer : '',
			explanation: typeof value?.explanation === 'string' ? value.explanation : '',
			points: normalizePoints(value?.points)
		};
	}

	function normalizeSavedQuestions(value: unknown): SavedQuestion[] {
		if (!Array.isArray(value)) return [];

		return value
			.map((question) => normalizeSavedQuestion(question))
			.filter((question): question is SavedQuestion => Boolean(question));
	}

	function normalizeSavedQuestion(value: unknown): SavedQuestion | null {
		if (!value || typeof value !== 'object') return null;

		const question = value as Partial<SavedQuestion>;
		const normalized = normalizeQuestionDraft(question);
		const promptText =
			typeof question.promptText === 'string'
				? question.promptText
				: getPlainText(normalized.promptHtml);

		if (!promptText.trim()) return null;

		return {
			...normalized,
			id: typeof question.id === 'string' ? question.id : createId('question'),
			promptText: promptText.trim()
		};
	}

	function getPlainText(html: string) {
		return html
			.replace(/<script[\s\S]*?<\/script>/gi, '')
			.replace(/<style[\s\S]*?<\/style>/gi, '')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function getQuestionErrors() {
		const errors: string[] = [];

		if (promptText.length < 4) {
			errors.push('Add question text.');
		}

		if (!Number.isFinite(questionDraft.points) || questionDraft.points < 1 || questionDraft.points > 100) {
			errors.push('Use 1 to 100 points.');
		}

		if (questionDraft.type === 'multiple-choice') {
			if (
				questionDraft.options.length < minMultipleChoiceOptions ||
				questionDraft.options.length > maxMultipleChoiceOptions
			) {
				errors.push('Use 2 to 6 answer options.');
			}

			if (questionDraft.options.some((option) => !option.text.trim())) {
				errors.push('Fill every answer option.');
			}

			if (!questionDraft.options.some((option) => option.id === questionDraft.correctOptionId)) {
				errors.push('Mark the correct answer.');
			}
		}

		if (questionDraft.type === 'fill-blank' && !questionDraft.blankAnswer.trim()) {
			errors.push('Add the accepted answer.');
		}

		return errors;
	}

	function getCorrectAnswerPreview(question: QuestionDraft) {
		if (question.type === 'true-false') {
			return question.trueFalseAnswer ? 'True' : 'False';
		}

		if (question.type === 'fill-blank') {
			return question.blankAnswer.trim() || 'Accepted answer pending';
		}

		const correctIndex = question.options.findIndex((option) => option.id === question.correctOptionId);
		const correctOption = question.options[correctIndex];
		return correctOption?.text.trim() || `Option ${getOptionLabel(correctIndex >= 0 ? correctIndex : 0)}`;
	}

	function getOptionLabel(index: number) {
		return String.fromCharCode(65 + index);
	}

	function formatQuestionType(type: QuestionType) {
		return questionTypes.find((questionType) => questionType.value === type)?.label ?? 'Question';
	}

	function formatTimer(totalSeconds: number) {
		const safeSeconds = Math.max(0, Math.floor(totalSeconds));
		const minutes = Math.floor(safeSeconds / 60);
		const seconds = safeSeconds % 60;

		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function getSharedDifficulty(): 1 | 2 | 3 {
		if (draft.difficulty === 'Hard') return 3;
		if (draft.difficulty === 'Medium') return 2;

		return 1;
	}

	function createShareSlug(value: string) {
		const slug = value
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

		return slug || 'shared-quiz';
	}

	function createSharedQuestion(question: SavedQuestion): SharedQuestion {
		const sharedQuestion = {
			id: question.id,
			type: question.type,
			prompt: question.promptText,
			difficulty: getSharedDifficulty(),
			explanation: question.explanation,
			points: normalizePoints(question.points)
		};

		if (question.type === 'true-false') {
			return {
				...sharedQuestion,
				trueFalseAnswer: question.trueFalseAnswer
			};
		}

		if (question.type === 'fill-blank') {
			return {
				...sharedQuestion,
				blankAnswer: question.blankAnswer
			};
		}

		return {
			...sharedQuestion,
			options: question.options.map((option) => ({
				id: option.id,
				text: option.text
			})),
			correctOptionId: question.correctOptionId
		};
	}

	function createSharePayload(): SharedQuizPayload {
		return {
			id: createShareSlug(draft.title),
			title: draft.title,
			category: draft.category,
			description: draft.description,
			hasTimeLimit: draft.hasTimeLimit,
			timeLimitSeconds: draft.hasTimeLimit ? getNormalizedTimeLimitSeconds() : 0,
			timeMode: draft.timeMode,
			questions: savedQuestions.map(createSharedQuestion)
		};
	}

	function encodeSharePayload(payload: SharedQuizPayload) {
		const json = JSON.stringify(payload);
		const bytes = new TextEncoder().encode(json);
		const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

		return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
	}

	function createShareLink() {
		if (!browser || quizStatus !== 'published' || publishBlockReason) return '';

		const url = new URL(`${base}/play/shared`, window.location.origin);
		url.hash = `quiz=${encodeSharePayload(createSharePayload())}`;

		return url.toString();
	}

	async function copyShareLink() {
		if (!shareLink) return;

		try {
			await navigator.clipboard.writeText(shareLink);
			setManagementFeedback('Share link copied.');
		} catch {
			setManagementFeedback('Could not copy the share link.', 'error');
		}
	}

	function getNormalizedTimeLimitSeconds() {
		const seconds = Number(draft.timeLimitSeconds);
		if (!Number.isFinite(seconds)) return 30;

		return Math.min(10800, Math.max(1, Math.round(seconds)));
	}

	function getPreviewBlockReason() {
		if (!isValid) return 'Resolve setup errors before previewing.';
		if (savedQuestions.length === 0) return 'Add at least one question before previewing.';

		return '';
	}

	function canSubmitPreviewAnswer(question?: SavedQuestion) {
		if (!question || previewSubmittedAnswer) return false;

		if (question.type === 'multiple-choice') {
			return question.options.some((option) => option.id === previewSelectedOptionId);
		}

		if (question.type === 'true-false') {
			return previewTrueFalseAnswer !== null;
		}

		return previewBlankAnswer.trim().length > 0;
	}

	function getCurrentPreviewAnswerValue(question: SavedQuestion): PreviewAnswerValue {
		if (question.type === 'multiple-choice') return previewSelectedOptionId || null;
		if (question.type === 'true-false') return previewTrueFalseAnswer;

		return previewBlankAnswer;
	}

	function normalizePreviewTextAnswer(value: string) {
		return value.trim().replace(/\s+/g, ' ').toLowerCase();
	}

	function getPreviewCorrectAnswerText(question: SavedQuestion) {
		if (question.type === 'true-false') {
			return question.trueFalseAnswer ? 'True' : 'False';
		}

		if (question.type === 'fill-blank') {
			return question.blankAnswer.trim();
		}

		const correctOption = question.options.find((option) => option.id === question.correctOptionId);
		return correctOption?.text.trim() ?? 'Correct answer missing';
	}

	function getPreviewAnswerText(question: SavedQuestion, value: PreviewAnswerValue, timedOut: boolean) {
		if (timedOut || value === null || value === '') return 'No answer';

		if (question.type === 'multiple-choice') {
			const selectedOption = question.options.find((option) => option.id === value);
			return selectedOption?.text.trim() ?? 'No answer';
		}

		if (question.type === 'true-false') {
			return value ? 'True' : 'False';
		}

		return String(value).trim();
	}

	function isPreviewAnswerCorrect(
		question: SavedQuestion,
		value: PreviewAnswerValue,
		timedOut: boolean
	) {
		if (timedOut || value === null || value === '') return false;

		if (question.type === 'multiple-choice') {
			return value === question.correctOptionId;
		}

		if (question.type === 'true-false') {
			return value === question.trueFalseAnswer;
		}

		return normalizePreviewTextAnswer(String(value)) === normalizePreviewTextAnswer(question.blankAnswer);
	}

	function createPreviewAnswer(
		question: SavedQuestion,
		value: PreviewAnswerValue,
		timedOut = false
	): PreviewAnswer {
		const pointsPossible = normalizePoints(question.points);
		const isCorrect = isPreviewAnswerCorrect(question, value, timedOut);

		return {
			questionId: question.id,
			type: question.type,
			promptText: question.promptText,
			answerText: getPreviewAnswerText(question, value, timedOut),
			correctAnswerText: getPreviewCorrectAnswerText(question),
			isCorrect,
			pointsEarned: isCorrect ? pointsPossible : 0,
			pointsPossible,
			timedOut,
			explanation: question.explanation
		};
	}

	function selectPreviewOption(optionId: string) {
		if (previewSubmittedAnswer) return;
		previewSelectedOptionId = optionId;
	}

	function setPreviewTrueFalseAnswer(answer: boolean) {
		if (previewSubmittedAnswer) return;
		previewTrueFalseAnswer = answer;
	}

	function resetPreviewQuestionInputs() {
		previewSelectedOptionId = '';
		previewTrueFalseAnswer = null;
		previewBlankAnswer = '';
		previewSubmittedAnswer = null;
	}

	function startPreview() {
		attemptedSubmit = true;
		if (previewBlockReason) {
			setManagementFeedback(previewBlockReason, 'error');
			return;
		}

		stopPreviewTimer();
		previewStatus = 'playing';
		previewAnswers = [];
		previewStartedAt = new Date().toISOString();
		preparePreviewQuestion(0);

		if (draft.hasTimeLimit && draft.timeMode === 'total') {
			startPreviewTimer(getNormalizedTimeLimitSeconds());
		}

		setManagementFeedback('Preview started.', 'neutral');

		if (browser) {
			setTimeout(() => previewPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
		}
	}

	function restartPreview() {
		startPreview();
	}

	function preparePreviewQuestion(index: number) {
		previewIndex = index;
		resetPreviewQuestionInputs();

		if (!draft.hasTimeLimit) {
			stopPreviewTimer();
			return;
		}

		if (draft.timeMode === 'per-question') {
			startPreviewTimer(getNormalizedTimeLimitSeconds());
		}
	}

	function startPreviewTimer(seconds: number) {
		stopPreviewTimer();
		previewSecondsRemaining = seconds;

		if (!browser) return;

		previewTimerId = window.setInterval(() => {
			previewSecondsRemaining = Math.max(0, previewSecondsRemaining - 1);
			if (previewSecondsRemaining <= 0) {
				handlePreviewTimeout();
			}
		}, 1000);
	}

	function stopPreviewTimer() {
		if (previewTimerId !== null && browser) {
			window.clearInterval(previewTimerId);
		}
		previewTimerId = null;
	}

	function handlePreviewTimeout() {
		if (previewStatus !== 'playing') return;

		if (draft.timeMode === 'total') {
			if (!previewSubmittedAnswer && previewQuestion) {
				submitPreviewAnswer(true);
			}
			finishPreview('Time is up. Preview results are ready.');
			return;
		}

		if (!previewSubmittedAnswer) {
			submitPreviewAnswer(true);
			setManagementFeedback('Time expired for this preview question.', 'neutral');
		}
	}

	function submitPreviewAnswer(timedOut = false) {
		if (!previewQuestion || previewSubmittedAnswer) return;
		if (!timedOut && !previewCanSubmit) return;

		const answer = createPreviewAnswer(
			previewQuestion,
			timedOut ? null : getCurrentPreviewAnswerValue(previewQuestion),
			timedOut
		);

		previewSubmittedAnswer = answer;
		previewAnswers = [...previewAnswers, answer];

		if (!draft.hasTimeLimit || draft.timeMode === 'per-question') {
			stopPreviewTimer();
		}
	}

	function advancePreview() {
		if (!previewSubmittedAnswer) {
			submitPreviewAnswer();
			return;
		}

		if (previewIsLastQuestion) {
			finishPreview();
			return;
		}

		preparePreviewQuestion(previewIndex + 1);
	}

	function finishPreview(message = 'Preview complete.') {
		const answeredQuestionIds = new Set(previewAnswers.map((answer) => answer.questionId));
		const unansweredAnswers = savedQuestions
			.filter((question) => !answeredQuestionIds.has(question.id))
			.map((question) => createPreviewAnswer(question, null, true));

		if (unansweredAnswers.length > 0) {
			previewAnswers = [...previewAnswers, ...unansweredAnswers];
		}

		previewStatus = 'results';
		previewSubmittedAnswer = null;
		stopPreviewTimer();
		setManagementFeedback(message, 'neutral');
	}

	function resetPreviewSession() {
		stopPreviewTimer();
		previewStatus = 'idle';
		previewIndex = 0;
		previewAnswers = [];
		previewStartedAt = '';
		previewSecondsRemaining = 0;
		resetPreviewQuestionInputs();
	}

	function exitPreview() {
		resetPreviewSession();
		setManagementFeedback('Returned to editor.', 'neutral');
	}

	function serializeQuestionDraft(question: QuestionDraft): QuestionDraft {
		return {
			type: question.type,
			promptHtml: question.promptHtml,
			options: question.options.map((option) => ({
				id: option.id,
				text: option.text
			})),
			correctOptionId: question.correctOptionId,
			trueFalseAnswer: question.trueFalseAnswer,
			blankAnswer: question.blankAnswer,
			explanation: question.explanation,
			points: question.points
		};
	}

	function serializeSavedQuestion(question: SavedQuestion): SavedQuestion {
		return {
			...serializeQuestionDraft(question),
			id: question.id,
			promptText: question.promptText
		};
	}

	onMount(() => {
		if (!browser) return;

		const saved = localStorage.getItem(draftKey);
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as StoredQuizDraft;
				const defaultDraft = createDefaultDraft();
				const difficulty = difficulties.includes(parsed.difficulty as Difficulty)
					? (parsed.difficulty as Difficulty)
					: defaultDraft.difficulty;
				const timeMode = timeModes.some((mode) => mode.value === parsed.timeMode)
					? (parsed.timeMode as TimeMode)
					: defaultDraft.timeMode;
				const category =
					parsed.category && categories.includes(parsed.category) ? parsed.category : defaultDraft.category;
				const savedSeconds = Number(parsed.timeLimitSeconds);
				const legacyMinutes = Number(parsed.timeLimitMinutes);
				const timeLimitSeconds =
					savedSeconds > 0
						? savedSeconds
						: legacyMinutes > 0
							? legacyMinutes * 60
							: defaultDraft.timeLimitSeconds;

				draft = {
					title: typeof parsed.title === 'string' ? parsed.title : defaultDraft.title,
					description:
						typeof parsed.description === 'string' ? parsed.description : defaultDraft.description,
					category,
					difficulty,
					hasTimeLimit:
						typeof parsed.hasTimeLimit === 'boolean'
							? parsed.hasTimeLimit
							: defaultDraft.hasTimeLimit,
					timeLimitSeconds,
					timeMode,
					updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : defaultDraft.updatedAt
				};
				questionDraft = normalizeQuestionDraft(parsed.questionBuilder?.current);
				savedQuestions = normalizeSavedQuestions(parsed.questionBuilder?.questions);
				quizStatus = parsed.quizStatus === 'published' ? 'published' : 'draft';
				lastManualSaveAt =
					typeof parsed.lastManualSaveAt === 'string' ? parsed.lastManualSaveAt : '';
				saveState = 'loaded';
			} catch {
				localStorage.removeItem(draftKey);
			}
		}

		draftReady = true;

		return () => {
			stopPreviewTimer();
		};
	});

	$effect(() => {
		if (!browser || !draftReady) return;

		const snapshot = {
			...draftSnapshot,
			questionBuilder: questionSnapshot,
			quizStatus,
			lastManualSaveAt,
			title: draftSnapshot.title.trimStart(),
			updatedAt: new Date().toISOString()
		};

		localStorage.setItem(draftKey, JSON.stringify(snapshot));
		saveState = 'saved';
	});

	$effect(() => {
		const editor = promptEditor;
		const html = questionDraft.promptHtml;
		if (!editor) return;

		if (editor.innerHTML !== html) {
			editor.innerHTML = html;
		}
	});

	function selectDifficulty(difficulty: Difficulty) {
		draft.difficulty = difficulty;
	}

	function selectTimeMode(timeMode: TimeMode) {
		draft.timeMode = timeMode;
	}

	function continueToQuestionBuilder() {
		attemptedSubmit = true;
		if (!isValid) return;

		draft.title = draft.title.trim();
		builderReady = true;

		if (browser) {
			setTimeout(() => promptEditor?.focus(), 0);
		}
	}

	function editSetup() {
		builderReady = false;
	}

	function resetDraft() {
		resetPreviewSession();
		draft = createDefaultDraft();
		questionDraft = createQuestionDraft();
		savedQuestions = [];
		editingQuestionId = null;
		draggingQuestionId = null;
		dragOverQuestionId = null;
		quizStatus = 'draft';
		lastManualSaveAt = '';
		managementFeedback = '';
		managementFeedbackTone = 'neutral';
		attemptedSubmit = false;
		attemptedQuestionSave = false;
		builderReady = false;
	}

	function selectQuestionType(type: QuestionType) {
		questionDraft.type = type;

		if (type === 'multiple-choice') {
			questionDraft.options = normalizeOptions(questionDraft.options);
			if (!questionDraft.options.some((option) => option.id === questionDraft.correctOptionId)) {
				questionDraft.correctOptionId = questionDraft.options[0].id;
			}
		}
	}

	function handlePromptInput() {
		questionDraft.promptHtml = promptEditor?.innerHTML ?? '';
	}

	function handlePromptPaste(event: ClipboardEvent) {
		if (!browser) return;

		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') ?? '';
		document.execCommand('insertText', false, text);
		handlePromptInput();
	}

	function applyRichCommand(command: 'bold' | 'italic' | 'insertUnorderedList') {
		if (!browser) return;

		promptEditor?.focus();
		document.execCommand(command, false);
		handlePromptInput();
	}

	function addOption() {
		if (questionDraft.options.length >= maxMultipleChoiceOptions) return;

		questionDraft.options = [...questionDraft.options, createOption()];
	}

	function removeOption(optionId: string) {
		if (questionDraft.options.length <= minMultipleChoiceOptions) return;

		const nextOptions = questionDraft.options.filter((option) => option.id !== optionId);
		questionDraft.options = nextOptions;

		if (!nextOptions.some((option) => option.id === questionDraft.correctOptionId)) {
			questionDraft.correctOptionId = nextOptions[0].id;
		}
	}

	function markCorrectOption(optionId: string) {
		questionDraft.correctOptionId = optionId;
	}

	function setTrueFalseAnswer(answer: boolean) {
		questionDraft.trueFalseAnswer = answer;
	}

	function saveQuestion() {
		attemptedQuestionSave = true;
		if (!canSaveQuestion) return;

		const savedQuestion = createSavedQuestion(editingQuestionId ?? undefined);
		if (editingQuestionId) {
			savedQuestions = savedQuestions.map((question) =>
				question.id === editingQuestionId ? savedQuestion : question
			);
			editingQuestionId = null;
			markDraftChanged('Question updated.');
		} else {
			savedQuestions = [...savedQuestions, savedQuestion];
			markDraftChanged('Question saved.');
		}

		questionDraft = createQuestionDraft(questionDraft.type);
		attemptedQuestionSave = false;

		if (browser) {
			setTimeout(() => promptEditor?.focus(), 0);
		}
	}

	function createSavedQuestion(questionId = createId('question')): SavedQuestion {
		const normalizedQuestion = serializeQuestionDraft(questionDraft);
		normalizedQuestion.promptHtml = normalizedQuestion.promptHtml.trim();
		normalizedQuestion.options = normalizedQuestion.options.map((option) => ({
			...option,
			text: option.text.trim()
		}));
		normalizedQuestion.blankAnswer = normalizedQuestion.blankAnswer.trim();
		normalizedQuestion.explanation = normalizedQuestion.explanation.trim();
		normalizedQuestion.points = normalizePoints(normalizedQuestion.points);

		return {
			...normalizedQuestion,
			id: questionId,
			promptText
		};
	}

	function clearQuestion() {
		questionDraft = createQuestionDraft(questionDraft.type);
		attemptedQuestionSave = false;
		if (editingQuestionId) {
			editingQuestionId = null;
			setManagementFeedback('Editing canceled.', 'neutral');
		}
	}

	function editSavedQuestion(questionId: string) {
		const question = savedQuestions.find((savedQuestion) => savedQuestion.id === questionId);
		if (!question) return;

		questionDraft = serializeQuestionDraft(question);
		editingQuestionId = questionId;
		builderReady = true;
		attemptedQuestionSave = false;
		setManagementFeedback(`Editing question ${getQuestionPosition(questionId)}.`, 'neutral');

		if (browser) {
			setTimeout(() => promptEditor?.focus(), 0);
		}
	}

	function deleteSavedQuestion(questionId: string) {
		savedQuestions = savedQuestions.filter((question) => question.id !== questionId);
		if (editingQuestionId === questionId) {
			editingQuestionId = null;
			questionDraft = createQuestionDraft();
		}
		markDraftChanged('Question deleted.');
	}

	function moveQuestion(questionId: string, direction: MoveDirection) {
		const currentIndex = savedQuestions.findIndex((question) => question.id === questionId);
		const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
		if (currentIndex < 0 || targetIndex < 0 || targetIndex >= savedQuestions.length) return;

		const nextQuestions = [...savedQuestions];
		const [movedQuestion] = nextQuestions.splice(currentIndex, 1);
		nextQuestions.splice(targetIndex, 0, movedQuestion);
		savedQuestions = nextQuestions;
		markDraftChanged('Question order updated.');
	}

	function handleQuestionDragStart(event: DragEvent, questionId: string) {
		draggingQuestionId = questionId;
		dragOverQuestionId = null;
		event.dataTransfer?.setData('text/plain', questionId);
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleQuestionDragOver(event: DragEvent, questionId: string) {
		event.preventDefault();
		if (questionId !== draggingQuestionId) {
			dragOverQuestionId = questionId;
		}
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleQuestionDragLeave(questionId: string) {
		if (dragOverQuestionId === questionId) {
			dragOverQuestionId = null;
		}
	}

	function handleQuestionDrop(event: DragEvent, targetQuestionId: string) {
		event.preventDefault();
		const sourceQuestionId = event.dataTransfer?.getData('text/plain') || draggingQuestionId;
		if (sourceQuestionId) {
			reorderQuestion(sourceQuestionId, targetQuestionId);
		}
		handleQuestionDragEnd();
	}

	function handleQuestionDragEnd() {
		draggingQuestionId = null;
		dragOverQuestionId = null;
	}

	function reorderQuestion(sourceQuestionId: string, targetQuestionId: string) {
		if (sourceQuestionId === targetQuestionId) return;

		const sourceIndex = savedQuestions.findIndex((question) => question.id === sourceQuestionId);
		const targetIndex = savedQuestions.findIndex((question) => question.id === targetQuestionId);
		if (sourceIndex < 0 || targetIndex < 0) return;

		const nextQuestions = [...savedQuestions];
		const [movedQuestion] = nextQuestions.splice(sourceIndex, 1);
		nextQuestions.splice(targetIndex, 0, movedQuestion);
		savedQuestions = nextQuestions;
		markDraftChanged('Question order updated.');
	}

	function saveDraftManually() {
		quizStatus = 'draft';
		lastManualSaveAt = new Date().toISOString();
		setManagementFeedback('Draft saved locally.');
	}

	function publishQuiz() {
		attemptedSubmit = true;
		if (publishBlockReason) {
			setManagementFeedback(publishBlockReason, 'error');
			return;
		}

		quizStatus = 'published';
		lastManualSaveAt = new Date().toISOString();
		setManagementFeedback('Quiz published locally.');
	}

	function markDraftChanged(message: string) {
		if (isPreviewActive) {
			resetPreviewSession();
		}
		if (quizStatus === 'published') {
			quizStatus = 'draft';
		}
		setManagementFeedback(message);
	}

	function setManagementFeedback(message: string, tone: FeedbackTone = 'success') {
		managementFeedback = message;
		managementFeedbackTone = tone;
	}

	function getQuestionPosition(questionId: string) {
		const index = savedQuestions.findIndex((question) => question.id === questionId);
		return index >= 0 ? index + 1 : savedQuestions.length + 1;
	}

	function formatTimestamp(value: string) {
		return new Date(value).toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<div class="container">
	<header class="page-header">
		<div>
			<p class="eyebrow">Quiz creator</p>
			<h1>Build a quiz draft</h1>
			<p class="subtitle">Set the basics for a trivia-night quiz, then carry the saved draft into questions.</p>
		</div>
		<div class="header-actions">
			<a class="secondary-button" href="{base}/">All packs</a>
			<span class="save-pill" aria-live="polite">{saveLabel}</span>
		</div>
	</header>

	<main class="workspace">
		<section class="setup-panel" aria-labelledby="setup-title">
			<div class="panel-heading">
				<div>
					<p class="step-label">Step 1</p>
					<h2 id="setup-title">Quiz setup</h2>
				</div>
				<button type="button" class="text-button" onclick={resetDraft}>Reset</button>
			</div>

			<form class="setup-form" novalidate onsubmit={(event) => { event.preventDefault(); continueToQuestionBuilder(); }}>
				<label class="field">
					<span>Title</span>
					<input
						type="text"
						autocomplete="off"
						placeholder="Premier League pub quiz"
						bind:value={draft.title}
						aria-invalid={attemptedSubmit && !!titleError}
					/>
					{#if attemptedSubmit && titleError}
						<span class="field-error">{titleError}</span>
					{/if}
				</label>

				<label class="field">
					<span>Description</span>
					<textarea
						rows="4"
						placeholder="A fast round for friends before kickoff."
						bind:value={draft.description}
					></textarea>
				</label>

				<div class="field-grid">
					<label class="field">
						<span>Category</span>
						<select bind:value={draft.category}>
							{#each categories as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
					</label>

					<div class="field">
						<span>Difficulty</span>
						<div class="segmented" role="group" aria-label="Difficulty">
							{#each difficulties as difficulty}
								<button
									type="button"
									class:selected={draft.difficulty === difficulty}
									aria-pressed={draft.difficulty === difficulty}
									onclick={() => selectDifficulty(difficulty)}
								>
									{difficulty}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<div class="time-section">
					<label class="toggle-row">
						<input type="checkbox" bind:checked={draft.hasTimeLimit} />
						<span>
							<strong>Time limit</strong>
							<small>{timeSummary}</small>
						</span>
					</label>

					{#if draft.hasTimeLimit}
						<div class="time-controls">
							<label class="field compact">
								<span>Seconds</span>
								<input
									type="number"
									min="1"
									max="10800"
									step="1"
									bind:value={draft.timeLimitSeconds}
									aria-invalid={attemptedSubmit && !!timeError}
								/>
								{#if attemptedSubmit && timeError}
									<span class="field-error">{timeError}</span>
								{/if}
							</label>

							<div class="field compact">
								<span>Timer mode</span>
								<div class="segmented" role="group" aria-label="Timer mode">
									{#each timeModes as mode}
										<button
											type="button"
											class:selected={draft.timeMode === mode.value}
											aria-pressed={draft.timeMode === mode.value}
											onclick={() => selectTimeMode(mode.value)}
										>
											{mode.label}
										</button>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<div class="form-actions">
					<button type="submit" class="primary-button">
						{builderReady ? 'Update builder setup' : 'Continue to question builder'}
					</button>
					<span class="validation-note">
						{#if isValid}
							Ready for questions
						{:else}
							Title required
						{/if}
					</span>
				</div>
			</form>
		</section>

		<section class="builder-panel" class:ready={builderReady} aria-live="polite">
			<div class="panel-heading">
				<div>
					<p class="step-label">Step 2</p>
					<h2>Question builder</h2>
				</div>
				{#if builderReady}
					<button type="button" class="text-button" onclick={editSetup}>Pause</button>
				{/if}
			</div>

			{#if builderReady}
				<div class="builder-form">
					<div class="field">
						<span>Question type</span>
						<div class="segmented question-type-control" role="group" aria-label="Question type">
							{#each questionTypes as type}
								<button
									type="button"
									class:selected={questionDraft.type === type.value}
									aria-pressed={questionDraft.type === type.value}
									onclick={() => selectQuestionType(type.value)}
								>
									{type.label}
								</button>
							{/each}
						</div>
					</div>

					{#if editingQuestionId}
						<div class="editing-banner" role="status">
							<span>Editing question {getQuestionPosition(editingQuestionId)}</span>
						</div>
					{/if}

					<div class="field">
						<span>Question text</span>
						<div class="rich-editor" class:error={attemptedQuestionSave && promptText.length < 4}>
							<div class="rich-toolbar" role="toolbar" aria-label="Question formatting">
								<button type="button" aria-label="Bold" title="Bold" onclick={() => applyRichCommand('bold')}>
									<strong>B</strong>
								</button>
								<button type="button" aria-label="Italic" title="Italic" onclick={() => applyRichCommand('italic')}>
									<em>I</em>
								</button>
								<button
									type="button"
									aria-label="Bulleted list"
									title="Bulleted list"
									onclick={() => applyRichCommand('insertUnorderedList')}
								>
									&bull;
								</button>
							</div>
							<div
								class="editor-surface"
								bind:this={promptEditor}
								contenteditable="true"
								role="textbox"
								aria-multiline="true"
								aria-label="Question text"
								aria-invalid={attemptedQuestionSave && promptText.length < 4}
								tabindex="0"
								data-empty={promptText.length === 0}
								data-placeholder="Ask the question"
								oninput={handlePromptInput}
								onpaste={handlePromptPaste}
							></div>
						</div>
						{#if attemptedQuestionSave && promptText.length < 4}
							<span class="field-error">Add question text.</span>
						{/if}
					</div>

					<div class="type-control-stack" aria-label="Answer controls">
						<div
							class="answer-section type-controls"
							hidden={!isMultipleChoiceQuestion}
							aria-hidden={!isMultipleChoiceQuestion}
						>
							<div class="answer-heading">
								<span>Answer options</span>
								<small>{questionDraft.options.length} of {maxMultipleChoiceOptions}</small>
							</div>

							<div class="option-heading" aria-hidden="true">
								<span>Correct</span>
								<span>Answer option</span>
							</div>

							<div class="option-list">
								{#each questionDraft.options as option, index (option.id)}
									<div class="option-row">
										<label class="correct-choice">
											<input
												type="radio"
												name="correct-option"
												checked={questionDraft.correctOptionId === option.id}
												onchange={() => markCorrectOption(option.id)}
											/>
											<span>{getOptionLabel(index)}</span>
										</label>
										<input
											type="text"
											placeholder={`Answer ${getOptionLabel(index)}`}
											bind:value={option.text}
											aria-invalid={attemptedQuestionSave && !option.text.trim()}
										/>
										{#if questionDraft.options.length > minMultipleChoiceOptions}
											<button
												type="button"
												class="remove-button"
												aria-label={`Remove answer ${getOptionLabel(index)}`}
												onclick={() => removeOption(option.id)}
											>
												Remove
											</button>
										{/if}
									</div>
								{/each}
							</div>

							<button
								type="button"
								class="secondary-button add-option"
								disabled={questionDraft.options.length >= maxMultipleChoiceOptions}
								onclick={addOption}
							>
								Add option
							</button>
						</div>

						<div
							class="field type-controls"
							hidden={!isTrueFalseQuestion}
							aria-hidden={!isTrueFalseQuestion}
						>
							<span>Correct answer</span>
							<div class="segmented boolean-control" role="group" aria-label="Correct answer">
								<button
									type="button"
									class:selected={questionDraft.trueFalseAnswer}
									aria-pressed={questionDraft.trueFalseAnswer}
									onclick={() => setTrueFalseAnswer(true)}
								>
									True
								</button>
								<button
									type="button"
									class:selected={!questionDraft.trueFalseAnswer}
									aria-pressed={!questionDraft.trueFalseAnswer}
									onclick={() => setTrueFalseAnswer(false)}
								>
									False
								</button>
							</div>
						</div>

						<label
							class="field type-controls"
							hidden={!isFillBlankQuestion}
							aria-hidden={!isFillBlankQuestion}
						>
							<span>Accepted answer</span>
							<input
								type="text"
								placeholder="photosynthesis"
								bind:value={questionDraft.blankAnswer}
								aria-invalid={attemptedQuestionSave && !questionDraft.blankAnswer.trim()}
							/>
							{#if attemptedQuestionSave && !questionDraft.blankAnswer.trim()}
								<span class="field-error">Add the accepted answer.</span>
							{/if}
						</label>
					</div>

					<div class="builder-meta">
						<label class="field points-field">
							<span>Points</span>
							<input
								type="number"
								min="1"
								max="100"
								step="1"
								bind:value={questionDraft.points}
								aria-invalid={attemptedQuestionSave && (!Number.isFinite(questionDraft.points) || questionDraft.points < 1 || questionDraft.points > 100)}
							/>
						</label>

						<div class="answer-preview">
							<span>Correct answer</span>
							<strong>{correctAnswerPreview}</strong>
						</div>
					</div>

					<label class="field">
						<span>Explanation</span>
						<textarea
							rows="4"
							placeholder="Show this after the answer is revealed."
							bind:value={questionDraft.explanation}
						></textarea>
					</label>

					{#if attemptedQuestionSave && questionErrors.length > 0}
						<ul class="error-list">
							{#each questionErrors as error}
								<li>{error}</li>
							{/each}
						</ul>
					{/if}

					<div class="form-actions builder-submit">
						<button type="button" class="primary-button" onclick={saveQuestion}>{saveQuestionLabel}</button>
						<button type="button" class="secondary-button" onclick={clearQuestion}>
							{editingQuestionId ? 'Cancel edit' : 'Clear'}
						</button>
					</div>

					<div class="saved-questions">
						<div class="saved-heading">
							<span>Draft questions</span>
							<strong>{savedQuestionCountLabel}</strong>
						</div>

						{#if savedQuestions.length > 0}
							<ol>
								{#each savedQuestions.slice(-3).reverse() as question (question.id)}
									<li>
										<span>
											{formatQuestionType(question.type)} - {question.points}
											{question.points === 1 ? 'point' : 'points'}
										</span>
										<strong>{question.promptText}</strong>
									</li>
								{/each}
							</ol>
						{:else}
							<p>No questions saved yet.</p>
						{/if}
					</div>
				</div>
			{:else}
				<p class="empty-state">Complete setup to unlock question building.</p>
				<div class="question-types" aria-label="Question types">
					<span>Multiple choice</span>
					<span>True / false</span>
					<span>Fill in the blank</span>
				</div>
			{/if}
		</section>

		<section class="management-panel" aria-labelledby="management-title">
			<div class="panel-heading">
				<div>
					<p class="step-label">Step 3</p>
					<h2 id="management-title">Quiz management</h2>
				</div>
				<span class="status-pill" class:published={quizStatus === 'published'}>{quizStatusLabel}</span>
			</div>

			<div class="management-summary" aria-label="Quiz summary">
				<div>
					<span>Questions</span>
					<strong>{savedQuestions.length}</strong>
				</div>
				<div>
					<span>Points</span>
					<strong>{totalPoints}</strong>
				</div>
				<div>
					<span>Manual save</span>
					<strong>{lastManualSaveLabel}</strong>
				</div>
			</div>

			<div class="management-toolbar">
				<div class="management-actions">
					<button type="button" class="secondary-button" onclick={saveDraftManually}>Save draft</button>
					<button type="button" class="primary-button" onclick={publishQuiz}>Publish</button>
					<button type="button" class="secondary-button" onclick={startPreview}>Preview quiz</button>
				</div>

				{#if managementFeedback}
					<p class:error={managementFeedbackTone === 'error'} class="management-feedback">
						{managementFeedback}
					</p>
				{/if}
			</div>

			<section class="share-panel" aria-labelledby="share-title">
				<div class="share-heading">
					<div>
						<p class="step-label">Share settings</p>
						<h3 id="share-title">Public link</h3>
					</div>
					<span class:ready={canShareQuiz}>{shareStatusLabel}</span>
				</div>

				{#if canShareQuiz}
					<div class="share-link-row">
						<label class="field">
							<span>Quiz URL</span>
							<input type="text" readonly value={shareLink} />
						</label>
						<div class="share-actions">
							<button type="button" class="secondary-button" onclick={copyShareLink}>Copy link</button>
							{#if shareLink}
								<a class="primary-button" href={shareLink} target="_blank" rel="noopener">Open link</a>
							{/if}
						</div>
					</div>
				{:else}
					<p class="share-empty">Resolve setup errors, add questions, and publish to create a public quiz URL.</p>
				{/if}
			</section>

			{#if isPreviewActive}
				<section class="preview-area" aria-labelledby="preview-title" bind:this={previewPanel}>
					<div class="preview-topbar">
						<div>
							<p class="step-label">Preview mode</p>
							<h3 id="preview-title">{draft.title || 'Untitled quiz'}</h3>
							<p>
								{#if previewStatus === 'playing'}
									{previewProgressLabel}
								{:else}
									{previewCorrectCount} of {savedQuestions.length} correct
								{/if}
							</p>
						</div>

						<div class="preview-meta">
							{#if draft.hasTimeLimit && previewStatus === 'playing'}
								<span class:warning={previewTimerWarning} class="timer-pill">
									{draft.timeMode === 'per-question' ? 'Question timer' : 'Quiz timer'} {previewTimerLabel}
								</span>
							{/if}
							<button type="button" class="secondary-button" onclick={exitPreview}>Back to editor</button>
						</div>
					</div>

					{#if previewStatus === 'playing' && previewQuestion}
						<div class="preview-progress" aria-hidden="true">
							<span style={`width: ${previewProgressWidth};`}></span>
						</div>

						<article class="preview-question-card">
							<div class="preview-question-heading">
								<span>{formatQuestionType(previewQuestion.type)}</span>
								<strong>
									{previewQuestion.points} {previewQuestion.points === 1 ? 'point' : 'points'}
								</strong>
							</div>

							<p class="preview-prompt">{previewQuestion.promptText}</p>

							{#if previewQuestion.type === 'multiple-choice'}
								<div class="preview-choice-list">
									{#each previewQuestion.options as option, index (option.id)}
										{@const isSelected = previewSelectedOptionId === option.id}
										{@const isCorrectOption =
											!!previewSubmittedAnswer && option.id === previewQuestion.correctOptionId}
										{@const isWrongOption =
											!!previewSubmittedAnswer &&
											isSelected &&
											option.id !== previewQuestion.correctOptionId}
										<button
											type="button"
											class="preview-choice"
											class:selected={isSelected}
											class:correct={isCorrectOption}
											class:wrong={isWrongOption}
											disabled={!!previewSubmittedAnswer}
											onclick={() => selectPreviewOption(option.id)}
										>
											<span>{getOptionLabel(index)}</span>
											<strong>{option.text}</strong>
										</button>
									{/each}
								</div>
							{:else if previewQuestion.type === 'true-false'}
								<div class="preview-boolean">
									<button
										type="button"
										class:selected={previewTrueFalseAnswer === true}
										class:correct={!!previewSubmittedAnswer && previewQuestion.trueFalseAnswer}
										class:wrong={!!previewSubmittedAnswer && previewTrueFalseAnswer === true && !previewQuestion.trueFalseAnswer}
										disabled={!!previewSubmittedAnswer}
										onclick={() => setPreviewTrueFalseAnswer(true)}
									>
										True
									</button>
									<button
										type="button"
										class:selected={previewTrueFalseAnswer === false}
										class:correct={!!previewSubmittedAnswer && !previewQuestion.trueFalseAnswer}
										class:wrong={!!previewSubmittedAnswer && previewTrueFalseAnswer === false && previewQuestion.trueFalseAnswer}
										disabled={!!previewSubmittedAnswer}
										onclick={() => setPreviewTrueFalseAnswer(false)}
									>
										False
									</button>
								</div>
							{:else}
								<label class="field preview-blank-field">
									<span>Your answer</span>
									<input
										type="text"
										placeholder="Type the answer"
										bind:value={previewBlankAnswer}
										disabled={!!previewSubmittedAnswer}
									/>
								</label>
							{/if}

							{#if previewSubmittedAnswer}
								<div
									class="preview-feedback"
									class:correct={previewSubmittedAnswer.isCorrect}
									class:wrong={!previewSubmittedAnswer.isCorrect}
								>
									<strong>
										{#if previewSubmittedAnswer.timedOut}
											Time expired.
										{:else if previewSubmittedAnswer.isCorrect}
											Correct.
										{:else}
											Not quite.
										{/if}
									</strong>
									<span>
										Correct answer: {previewSubmittedAnswer.correctAnswerText}
									</span>
									{#if previewSubmittedAnswer.explanation}
										<p>{previewSubmittedAnswer.explanation}</p>
									{/if}
								</div>
							{/if}

							<div class="preview-actions">
								<button
									type="button"
									class="primary-button"
									disabled={!previewSubmittedAnswer && !previewCanSubmit}
									onclick={advancePreview}
								>
									{#if previewSubmittedAnswer}
										{previewIsLastQuestion ? 'See results' : 'Next question'}
									{:else}
										Submit answer
									{/if}
								</button>
								<button type="button" class="secondary-button" onclick={restartPreview}>Restart</button>
							</div>
						</article>
					{:else}
						<div class="preview-results">
							<div class="preview-score">
								<span>{previewScorePercent}%</span>
								<strong>{previewEarnedPoints} of {totalPoints} points</strong>
								{#if previewStartedAt}
									<small>Started {formatTimestamp(previewStartedAt)}</small>
								{/if}
							</div>

							<div class="preview-result-actions">
								<button type="button" class="primary-button" onclick={restartPreview}>Replay preview</button>
								<button type="button" class="secondary-button" onclick={exitPreview}>Return to editing</button>
							</div>

							<ol class="preview-review-list">
								{#each previewAnswers as answer, index (answer.questionId)}
									<li class:correct={answer.isCorrect} class:wrong={!answer.isCorrect}>
										<div class="review-heading">
											<span>{index + 1}</span>
											<strong>{answer.promptText}</strong>
										</div>
										<div class="review-details">
											<p>Your answer: {answer.answerText}</p>
											<p>Correct answer: {answer.correctAnswerText}</p>
											<p>
												Score: {answer.pointsEarned} / {answer.pointsPossible}
												{answer.pointsPossible === 1 ? 'point' : 'points'}
											</p>
											{#if answer.explanation}
												<p>{answer.explanation}</p>
											{/if}
										</div>
									</li>
								{/each}
							</ol>
						</div>
					{/if}
				</section>
			{/if}

			{#if savedQuestions.length > 0}
				<ol class="managed-question-list">
					{#each savedQuestions as question, index (question.id)}
						<li
							class:dragging={draggingQuestionId === question.id}
							class:drag-over={dragOverQuestionId === question.id}
							draggable="true"
							ondragstart={(event) => handleQuestionDragStart(event, question.id)}
							ondragover={(event) => handleQuestionDragOver(event, question.id)}
							ondragleave={() => handleQuestionDragLeave(question.id)}
							ondrop={(event) => handleQuestionDrop(event, question.id)}
							ondragend={handleQuestionDragEnd}
						>
							<div class="managed-question-order">
								<span>{index + 1}</span>
								<span class="drag-handle" aria-hidden="true">::</span>
							</div>

							<div class="managed-question-body">
								<div class="managed-question-copy">
									<strong>{question.promptText}</strong>
									<span>
										{formatQuestionType(question.type)} - {question.points}
										{question.points === 1 ? 'point' : 'points'} - {getCorrectAnswerPreview(question)}
									</span>
								</div>

								<div class="managed-question-actions">
									<button type="button" class="secondary-button" onclick={() => editSavedQuestion(question.id)}>
										Edit
									</button>
									<button
										type="button"
										class="secondary-button"
										disabled={index === 0}
										onclick={() => moveQuestion(question.id, 'up')}
									>
										Up
									</button>
									<button
										type="button"
										class="secondary-button"
										disabled={index === savedQuestions.length - 1}
										onclick={() => moveQuestion(question.id, 'down')}
									>
										Down
									</button>
									<button
										type="button"
										class="danger-button"
										onclick={() => deleteSavedQuestion(question.id)}
									>
										Delete
									</button>
								</div>
							</div>
						</li>
					{/each}
				</ol>
			{:else}
				<div class="management-empty">
					<p>No questions saved yet.</p>
				</div>
			{/if}
		</section>
	</main>
</div>

<style>
	.container {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #141414;
	}

	.page-header,
	.panel-heading,
	.form-actions,
	.header-actions,
	.answer-heading,
	.saved-heading,
	.management-toolbar,
	.management-actions,
	.share-heading,
	.share-actions,
	.managed-question-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.eyebrow,
	.step-label {
		margin: 0 0 0.35rem;
		font-size: 0.74rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0;
		color: #0f766e;
	}

	h1,
	h2,
	h3,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.45rem;
		font-size: 3rem;
		line-height: 1;
		font-weight: 850;
		letter-spacing: 0;
	}

	h2 {
		margin-bottom: 0;
		font-size: 1.25rem;
		line-height: 1.2;
		letter-spacing: 0;
	}

	h3 {
		margin-bottom: 0;
		font-size: 1.08rem;
		line-height: 1.25;
		letter-spacing: 0;
	}

	.subtitle {
		max-width: 58ch;
		margin-bottom: 0;
		color: #555;
		line-height: 1.55;
	}

	.save-pill {
		flex-shrink: 0;
		border: 1px solid #b7e4dc;
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		padding: 0.45rem 0.75rem;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.header-actions {
		flex-shrink: 0;
		justify-content: flex-end;
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(320px, 0.8fr) minmax(420px, 1.2fr);
		gap: 1rem;
		align-items: start;
		margin-bottom: 2.5rem;
	}

	.setup-panel,
	.builder-panel,
	.management-panel {
		border: 1px solid #dedede;
		border-radius: 8px;
		background: #fff;
		padding: 1.25rem;
		box-shadow: 0 12px 30px rgba(20, 20, 20, 0.05);
	}

	.builder-panel {
		min-height: 25rem;
		display: flex;
		flex-direction: column;
	}

	.builder-panel.ready {
		border-color: #7dd3c7;
	}

	.management-panel {
		grid-column: 1 / -1;
		display: grid;
		gap: 1rem;
	}

	.text-button,
	.primary-button,
	.secondary-button,
	.segmented button,
	.rich-toolbar button,
	.remove-button,
	.danger-button {
		min-height: 2.5rem;
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

	.text-button {
		border: 0;
		background: transparent;
		color: #1d4ed8;
		padding: 0 0.25rem;
	}

	.text-button:hover {
		color: #0f766e;
	}

	.setup-form,
	.builder-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.25rem;
	}

	.field,
	.time-section,
	.answer-section,
	.type-control-stack {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.type-controls[hidden] {
		display: none;
	}

	.field > span,
	.answer-heading > span,
	.saved-heading > span {
		font-size: 0.86rem;
		font-weight: 750;
		color: #333;
	}

	input,
	textarea,
	select {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #cfcfcf;
		border-radius: 8px;
		background: #fff;
		padding: 0.78rem 0.85rem;
		font: inherit;
		color: #141414;
		outline: none;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	textarea {
		resize: vertical;
		min-height: 7.25rem;
	}

	input:focus,
	textarea:focus,
	select:focus,
	.editor-surface:focus {
		border-color: #1d4ed8;
		box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.13);
	}

	input[aria-invalid='true'],
	.rich-editor.error .editor-surface {
		border-color: #dc2626;
	}

	.field-error {
		color: #b91c1c;
		font-size: 0.78rem;
		font-weight: 650;
	}

	.field-grid,
	.time-controls,
	.builder-meta {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.segmented {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border: 1px solid #cfcfcf;
		border-radius: 8px;
		overflow: hidden;
	}

	.time-controls .segmented,
	.boolean-control {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.segmented button {
		border: 0;
		border-right: 1px solid #d9d9d9;
		border-radius: 0;
		background: #fff;
		color: #444;
		padding: 0.6rem 0.7rem;
		white-space: nowrap;
	}

	.segmented button:last-child {
		border-right: 0;
	}

	.segmented button.selected {
		background: #1d4ed8;
		color: #fff;
	}

	.time-section,
	.answer-section,
	.saved-questions {
		border-top: 1px solid #ececec;
		padding-top: 1rem;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.toggle-row input {
		width: 1.2rem;
		height: 1.2rem;
		accent-color: #0f766e;
	}

	.toggle-row span {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.toggle-row small,
	.answer-heading small {
		color: #666;
		font-size: 0.78rem;
	}

	.primary-button,
	.secondary-button,
	.danger-button {
		border: 1px solid transparent;
		padding: 0.7rem 1rem;
		text-decoration: none;
	}

	.primary-button {
		background: #1d4ed8;
		color: #fff;
	}

	.primary-button:hover {
		background: #1741b6;
		transform: translateY(-1px);
	}

	.secondary-button {
		background: #fff;
		border-color: #cfcfcf;
		color: #222;
	}

	.secondary-button:hover:not(:disabled) {
		border-color: #1d4ed8;
		color: #1d4ed8;
	}

	.secondary-button:disabled,
	.danger-button:disabled {
		color: #999;
		cursor: not-allowed;
	}

	.danger-button {
		background: #fff;
		border-color: #efcaca;
		color: #b91c1c;
	}

	.danger-button:hover:not(:disabled) {
		border-color: #b91c1c;
		background: #fff5f5;
	}

	.validation-note {
		color: #666;
		font-size: 0.85rem;
	}

	.editing-banner {
		border-left: 3px solid #1d4ed8;
		background: #f4f7fb;
		color: #1741b6;
		padding: 0.75rem 0.85rem;
		font-size: 0.88rem;
		font-weight: 800;
	}

	.rich-editor {
		overflow: hidden;
		border-radius: 8px;
	}

	.rich-toolbar {
		display: flex;
		gap: 0.35rem;
		border: 1px solid #cfcfcf;
		border-bottom: 0;
		border-radius: 8px 8px 0 0;
		background: #f8fafc;
		padding: 0.4rem;
	}

	.rich-toolbar button {
		width: 2.35rem;
		min-height: 2.1rem;
		border: 1px solid #d9d9d9;
		background: #fff;
		color: #222;
		padding: 0;
	}

	.rich-toolbar button:hover {
		border-color: #1d4ed8;
		color: #1d4ed8;
	}

	.editor-surface {
		min-height: 9.5rem;
		border: 1px solid #cfcfcf;
		border-radius: 0 0 8px 8px;
		background: #fff;
		padding: 0.85rem;
		line-height: 1.5;
		outline: none;
		overflow-wrap: anywhere;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	.editor-surface[data-empty='true']::before {
		content: attr(data-placeholder);
		color: #777;
		pointer-events: none;
	}

	.option-heading,
	.option-row {
		display: grid;
		grid-template-columns: 4.5rem minmax(0, 1fr) auto;
		gap: 0.65rem;
		align-items: center;
	}

	.option-heading {
		color: #666;
		font-size: 0.74rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.option-list {
		display: grid;
		gap: 0.6rem;
	}

	.correct-choice {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: #333;
		font-weight: 800;
		cursor: pointer;
	}

	.correct-choice input {
		width: 1.1rem;
		height: 1.1rem;
		accent-color: #0f766e;
	}

	.correct-choice span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		font-size: 0.78rem;
	}

	.remove-button {
		border: 1px solid #d9d9d9;
		background: #fff;
		color: #555;
		padding: 0.55rem 0.7rem;
	}

	.remove-button:hover {
		border-color: #b91c1c;
		color: #b91c1c;
	}

	.add-option {
		width: fit-content;
	}

	.points-field {
		max-width: 11rem;
	}

	.answer-preview {
		display: grid;
		align-content: center;
		gap: 0.2rem;
		min-height: 4.25rem;
		border-left: 3px solid #7dd3c7;
		padding-left: 0.85rem;
		overflow-wrap: anywhere;
	}

	.answer-preview span {
		color: #666;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.answer-preview strong {
		line-height: 1.35;
	}

	.error-list {
		margin: 0;
		padding-left: 1.2rem;
		color: #b91c1c;
		font-size: 0.85rem;
		font-weight: 650;
	}

	.builder-submit {
		justify-content: flex-start;
	}

	.saved-questions {
		display: grid;
		gap: 0.8rem;
	}

	.saved-heading strong {
		color: #0f766e;
		font-size: 0.86rem;
	}

	.saved-questions p {
		margin-bottom: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.saved-questions ol {
		display: grid;
		gap: 0.65rem;
		margin: 0;
		padding-left: 1.25rem;
	}

	.saved-questions li {
		padding-left: 0.15rem;
	}

	.saved-questions li span {
		display: block;
		color: #666;
		font-size: 0.78rem;
		font-weight: 750;
	}

	.saved-questions li strong {
		display: block;
		margin-top: 0.1rem;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.status-pill {
		flex-shrink: 0;
		border: 1px solid #d5d5d5;
		border-radius: 999px;
		background: #f7f7f7;
		color: #555;
		padding: 0.45rem 0.75rem;
		font-size: 0.82rem;
		font-weight: 800;
	}

	.status-pill.published {
		border-color: #b7e4dc;
		background: #effcf8;
		color: #0f766e;
	}

	.management-summary {
		display: grid;
		grid-template-columns: 0.7fr 0.7fr 1.6fr;
		gap: 1rem;
		border-top: 1px solid #ececec;
		border-bottom: 1px solid #ececec;
		padding: 1rem 0;
	}

	.management-summary div {
		display: grid;
		gap: 0.2rem;
	}

	.management-summary span {
		color: #666;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.management-summary strong {
		line-height: 1.3;
		overflow-wrap: anywhere;
	}

	.management-toolbar {
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.management-actions,
	.managed-question-actions {
		justify-content: flex-start;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.management-feedback {
		margin: 0;
		color: #0f766e;
		font-size: 0.88rem;
		font-weight: 750;
		line-height: 1.45;
	}

	.management-feedback.error {
		color: #b91c1c;
	}

	.share-panel {
		display: grid;
		gap: 1rem;
		border-top: 1px solid #ececec;
		border-bottom: 1px solid #ececec;
		padding: 1rem 0;
	}

	.share-heading > span {
		border: 1px solid #d5d5d5;
		border-radius: 999px;
		background: #f7f7f7;
		color: #555;
		padding: 0.45rem 0.75rem;
		font-size: 0.82rem;
		font-weight: 800;
	}

	.share-heading > span.ready {
		border-color: #b7e4dc;
		background: #effcf8;
		color: #0f766e;
	}

	.share-link-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: end;
	}

	.share-link-row input {
		font-size: 0.86rem;
	}

	.share-actions {
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.share-empty {
		margin-bottom: 0;
		color: #666;
		line-height: 1.5;
	}

	.preview-area {
		display: grid;
		gap: 1rem;
		margin: 0 -1.25rem;
		border-top: 1px solid #ececec;
		border-bottom: 1px solid #ececec;
		background: #f8fafc;
		padding: 1.25rem;
	}

	.preview-topbar,
	.preview-meta,
	.preview-question-heading,
	.preview-actions,
	.preview-result-actions,
	.review-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.preview-topbar h3 {
		margin: 0 0 0.35rem;
		font-size: 1.25rem;
		line-height: 1.2;
		letter-spacing: 0;
	}

	.preview-topbar p {
		margin-bottom: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.preview-meta {
		flex-shrink: 0;
		justify-content: flex-end;
	}

	.timer-pill {
		border: 1px solid #b7e4dc;
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		padding: 0.45rem 0.75rem;
		font-size: 0.82rem;
		font-weight: 800;
		white-space: nowrap;
	}

	.timer-pill.warning {
		border-color: #fed7aa;
		background: #fff7ed;
		color: #c2410c;
	}

	.preview-progress {
		overflow: hidden;
		height: 0.5rem;
		border-radius: 999px;
		background: #e5e7eb;
	}

	.preview-progress span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: #1d4ed8;
		transition: width 160ms ease;
	}

	.preview-question-card,
	.preview-results {
		display: grid;
		gap: 1rem;
	}

	.preview-question-heading {
		color: #666;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.preview-question-heading strong {
		color: #0f766e;
	}

	.preview-prompt {
		margin-bottom: 0;
		color: #111;
		font-size: 1.35rem;
		font-weight: 800;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.preview-choice-list {
		display: grid;
		gap: 0.65rem;
	}

	.preview-choice,
	.preview-boolean button {
		min-height: 3rem;
		border: 1.5px solid #d9d9d9;
		border-radius: 8px;
		background: #fff;
		color: #222;
		font: inherit;
		font-weight: 750;
		cursor: pointer;
		transition:
			background 120ms ease,
			border-color 120ms ease,
			color 120ms ease;
	}

	.preview-choice {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		text-align: left;
	}

	.preview-choice span {
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

	.preview-choice strong {
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.preview-choice:hover:not(:disabled),
	.preview-boolean button:hover:not(:disabled) {
		border-color: #1d4ed8;
	}

	.preview-choice.selected,
	.preview-boolean button.selected {
		border-color: #1d4ed8;
		background: #f4f7fb;
		color: #1741b6;
	}

	.preview-choice.correct,
	.preview-boolean button.correct {
		border-color: #16a34a;
		background: #f0fdf4;
		color: #14532d;
	}

	.preview-choice.correct span {
		background: #16a34a;
		color: #fff;
	}

	.preview-choice.wrong,
	.preview-boolean button.wrong {
		border-color: #dc2626;
		background: #fef2f2;
		color: #7f1d1d;
	}

	.preview-choice.wrong span {
		background: #dc2626;
		color: #fff;
	}

	.preview-choice:disabled,
	.preview-boolean button:disabled {
		cursor: default;
	}

	.preview-boolean {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.preview-blank-field {
		max-width: 32rem;
	}

	.preview-feedback {
		display: grid;
		gap: 0.35rem;
		border-left: 3px solid #d1d5db;
		background: #fff;
		padding: 0.85rem 1rem;
		line-height: 1.45;
	}

	.preview-feedback.correct {
		border-color: #16a34a;
		background: #f0fdf4;
		color: #14532d;
	}

	.preview-feedback.wrong {
		border-color: #dc2626;
		background: #fef2f2;
		color: #7f1d1d;
	}

	.preview-feedback p {
		margin-bottom: 0;
	}

	.preview-actions,
	.preview-result-actions {
		justify-content: flex-start;
		flex-wrap: wrap;
	}

	.preview-score {
		display: grid;
		gap: 0.25rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 1rem;
	}

	.preview-score span {
		color: #1d4ed8;
		font-size: 2.5rem;
		font-weight: 850;
		line-height: 1;
	}

	.preview-score strong {
		font-size: 1rem;
	}

	.preview-score small {
		color: #666;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.preview-review-list {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.preview-review-list li {
		display: grid;
		gap: 0.65rem;
		border-left: 3px solid #d1d5db;
		background: #fff;
		padding: 0.85rem 1rem;
	}

	.preview-review-list li.correct {
		border-color: #16a34a;
	}

	.preview-review-list li.wrong {
		border-color: #dc2626;
	}

	.review-heading {
		align-items: flex-start;
		justify-content: flex-start;
	}

	.review-heading span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.7rem;
		height: 1.7rem;
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		font-size: 0.78rem;
		font-weight: 850;
	}

	.review-heading strong {
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.review-details {
		display: grid;
		gap: 0.25rem;
		color: #555;
		font-size: 0.88rem;
		line-height: 1.45;
	}

	.review-details p {
		margin-bottom: 0;
		overflow-wrap: anywhere;
	}

	.managed-question-list {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.managed-question-list li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.85rem;
		border: 1px solid #dedede;
		border-radius: 8px;
		background: #fff;
		padding: 0.85rem;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease,
			opacity 120ms ease;
	}

	.managed-question-list li.dragging {
		opacity: 0.55;
	}

	.managed-question-list li.drag-over {
		border-color: #1d4ed8;
		box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.13);
	}

	.managed-question-order {
		display: grid;
		align-content: start;
		justify-items: center;
		gap: 0.35rem;
		color: #0f766e;
		font-weight: 850;
	}

	.managed-question-order > span:first-child {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		background: #effcf8;
	}

	.drag-handle {
		color: #777;
		cursor: grab;
		font-size: 1rem;
		letter-spacing: 0;
		line-height: 1;
	}

	.managed-question-body,
	.managed-question-copy {
		display: grid;
		min-width: 0;
	}

	.managed-question-body {
		gap: 0.85rem;
	}

	.managed-question-copy {
		gap: 0.25rem;
	}

	.managed-question-copy strong {
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.managed-question-copy span {
		color: #666;
		font-size: 0.82rem;
		font-weight: 750;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}

	.management-empty {
		border-top: 1px solid #ececec;
		padding-top: 1rem;
	}

	.management-empty p {
		margin-bottom: 0;
		color: #666;
	}

	.empty-state {
		margin: 1rem 0;
		color: #666;
		line-height: 1.5;
	}

	.question-types {
		display: grid;
		gap: 0.55rem;
		margin-top: auto;
	}

	.question-types span {
		border: 1px dashed #cfcfcf;
		border-radius: 8px;
		padding: 0.7rem 0.8rem;
		color: #555;
		font-size: 0.88rem;
		font-weight: 700;
	}

	@media (max-width: 920px) {
		.container {
			padding: 1.25rem;
		}

		.page-header,
		.workspace,
		.field-grid,
		.time-controls,
		.builder-meta,
		.management-summary,
		.header-actions {
			display: grid;
			grid-template-columns: 1fr;
		}

		.save-pill {
			width: fit-content;
		}

		.builder-panel {
			min-height: auto;
		}

		.points-field {
			max-width: none;
		}
	}

	@media (max-width: 560px) {
		.page-header,
		.panel-heading,
		.form-actions,
		.header-actions,
		.management-toolbar,
		.management-actions,
		.share-heading,
		.share-actions,
		.managed-question-actions,
		.preview-topbar,
		.preview-meta,
		.preview-actions,
		.preview-result-actions {
			align-items: flex-start;
			flex-direction: column;
		}

		.form-actions {
			gap: 0.65rem;
		}

		.share-link-row {
			grid-template-columns: 1fr;
		}

		h1 {
			font-size: 2rem;
		}

		.primary-button,
		.secondary-button,
		.danger-button {
			width: 100%;
		}

		.segmented,
		.time-controls .segmented,
		.boolean-control,
		.preview-boolean {
			grid-template-columns: 1fr;
		}

		.segmented button {
			border-right: 0;
			border-bottom: 1px solid #d9d9d9;
			white-space: normal;
		}

		.segmented button:last-child {
			border-bottom: 0;
		}

		.option-heading {
			display: none;
		}

		.option-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.correct-choice {
			width: fit-content;
		}

		.managed-question-list li {
			grid-template-columns: 1fr;
		}

		.managed-question-order {
			align-items: center;
			display: flex;
			justify-content: space-between;
		}
	}
</style>
