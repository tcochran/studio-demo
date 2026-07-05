export function computeScore(
	answers: { correct: boolean }[]
): { correct: number; total: number; percentage: number } {
	if (answers.length === 0) {
		return { correct: 0, total: 0, percentage: 0 };
	}

	const correct = answers.filter((answer) => answer.correct).length;
	const total = answers.length;
	const percentage = Math.round((correct / total) * 100);

	return { correct, total, percentage };
}
