import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { listPacks, getPack, getPacksByDifficulty, type Pack, type MultipleChoiceQuestion } from './packs';

const PACKS_DIR = resolve('src/lib/data/packs');

function loadAllPacks(): Pack[] {
	return readdirSync(PACKS_DIR)
		.filter((f) => f.endsWith('.json'))
		.map((f) => JSON.parse(readFileSync(resolve(PACKS_DIR, f), 'utf-8')) as Pack);
}

describe('listPacks', () => {
	const packs = listPacks();

	it('returns at least one pack', () => {
		expect(packs.length).toBeGreaterThan(0);
	});

	it('returns packs sorted by title', () => {
		const titles = packs.map((p) => p.title);
		const sorted = [...titles].sort((a, b) => a.localeCompare(b));
		expect(titles).toEqual(sorted);
	});
});

describe('getPack', () => {
	it('loads a known pack by id', () => {
		const pack = getPack('nyt-easy');
		expect(pack).not.toBeNull();
		expect(pack?.id).toBe('nyt-easy');
		expect(pack?.questions.length).toBeGreaterThan(0);
	});

	it('returns null for an unknown pack id', () => {
		expect(getPack('does-not-exist')).toBeNull();
	});
});

describe('getPacksByDifficulty', () => {
	it('returns all packs when min=1 (every pack has at least one difficulty-1 question)', () => {
		const all = listPacks();
		const result = getPacksByDifficulty(1);
		// All loaded packs have at least one question with difficulty 1, so all qualify.
		expect(result.length).toBe(all.length);
	});

	it('returns an empty array when min is higher than any pack lowest difficulty', () => {
		// Both current packs have questions with difficulty 1, so their lowest is 1 < 2.
		const result = getPacksByDifficulty(2);
		expect(result).toEqual([]);
	});

	it('returned packs have no question with difficulty < min', () => {
		// For min=1, every question in every returned pack must have difficulty >= 1.
		const result = getPacksByDifficulty(1);
		for (const pack of result) {
			const difficulties = pack.questions
				.map((q) => q.difficulty)
				.filter((d): d is NonNullable<typeof d> => d != null);
			for (const d of difficulties) {
				expect(d).toBeGreaterThanOrEqual(1);
			}
		}
	});
});

describe('pack schema — guards the rules from .studio/skills/quiz-content-conventions.md', () => {
	const packs = loadAllPacks();

	for (const pack of packs) {
		describe(`pack "${pack.id}"`, () => {
			it('has required top-level fields', () => {
				expect(pack.id).toBeTypeOf('string');
				expect(pack.title).toBeTypeOf('string');
				expect(pack.category).toBeTypeOf('string');
				expect(pack.description).toBeTypeOf('string');
				expect(Array.isArray(pack.questions)).toBe(true);
				expect(pack.questions.length).toBeGreaterThan(0);
			});

			it('every question has the required base fields', () => {
				for (const q of pack.questions) {
					expect(q.id, `${pack.id}: question missing id`).toBeTypeOf('string');
					expect(q.prompt.length).toBeGreaterThan(0);
					expect(q.explanation.length).toBeGreaterThan(0);
				}
			});

			it('question ids are sequential within the pack (skill rule: no gaps)', () => {
				// `ne-1, ne-2, ne-3, …` — extract the numeric suffix and check monotonic +1.
				const numbers = pack.questions
					.map((q) => /-(\d+)$/.exec(q.id)?.[1])
					.filter((n): n is string => n != null)
					.map(Number);
				expect(numbers.length).toBe(pack.questions.length);
				for (let i = 1; i < numbers.length; i++) {
					expect(numbers[i], `${pack.id}: gap or out-of-order at index ${i}`).toBe(numbers[i - 1] + 1);
				}
			});

			it('difficulty (when set) is an integer 1–5 (skill rule)', () => {
				for (const q of pack.questions) {
					if (q.difficulty == null) continue;
					expect(Number.isInteger(q.difficulty)).toBe(true);
					expect(q.difficulty).toBeGreaterThanOrEqual(1);
					expect(q.difficulty).toBeLessThanOrEqual(5);
				}
			});

			it('multiple-choice questions have exactly 4 choices and a valid correctIndex (skill rule: ban the index-mismatch trap)', () => {
				for (const q of pack.questions) {
					if (q.type && q.type !== 'multiple-choice') continue;
					const mc = q as MultipleChoiceQuestion;
					// The pack format allows either `choices` (string[]) or `options` (QuestionOption[]).
					if (mc.choices) {
						expect(mc.choices.length, `${pack.id}/${mc.id}: must have exactly 4 choices`).toBe(4);
						expect(mc.correctIndex, `${pack.id}/${mc.id}: correctIndex required when choices present`).toBeTypeOf('number');
						expect(mc.correctIndex!).toBeGreaterThanOrEqual(0);
						expect(mc.correctIndex!).toBeLessThan(mc.choices.length);
					}
				}
			});
		});
	}
});
