export function computeScore(
	answers: { correct: boolean }[]
): { correct: number; total: number; percentage: number } {
	const total = answers.length;
	const correct = answers.filter((answer) => answer.correct).length;
	const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

	return { correct, total, percentage };
}
