export function computeScore(answers: { correct: boolean }[]): { correct: number; total: number; percentage: number } {
	const total = answers.length;
	if (total === 0) {
		return { correct: 0, total: 0, percentage: 0 };
	}
	const correct = answers.filter((a) => a.correct).length;
	const percentage = Math.round((correct / total) * 100);
	return { correct, total, percentage };
}
