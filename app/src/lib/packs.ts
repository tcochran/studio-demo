import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { LRUCache } from './lru-cache';

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';
export type TimeMode = 'per-question' | 'total';

export type QuestionOption = {
	id: string;
	text: string;
};

type BaseQuestion = {
	id: string;
	prompt: string;
	type?: QuestionType;
	difficulty?: 1 | 2 | 3;
	explanation: string;
	points?: number;
};

export type MultipleChoiceQuestion = BaseQuestion & {
	type?: 'multiple-choice';
	choices?: string[];
	options?: QuestionOption[];
	correctIndex?: number;
	correctOptionId?: string;
};

export type TrueFalseQuestion = BaseQuestion & {
	type: 'true-false';
	trueFalseAnswer: boolean;
};

export type FillBlankQuestion = BaseQuestion & {
	type: 'fill-blank';
	blankAnswer: string;
};

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillBlankQuestion;

export type Pack = {
	id: string;
	title: string;
	category: string;
	description: string;
	hasTimeLimit?: boolean;
	timeLimitSeconds?: number;
	timeMode?: TimeMode;
	questions: Question[];
};

const PACKS_DIR = resolve('src/lib/data/packs');
const packCache = new LRUCache<string, Pack>(32);

export function listPacks(): Pack[] {
	return readdirSync(PACKS_DIR)
		.filter((f: string) => f.endsWith('.json'))
		.map((f: string) => JSON.parse(readFileSync(resolve(PACKS_DIR, f), 'utf-8')) as Pack)
		.sort((a: Pack, b: Pack) => a.title.localeCompare(b.title));
}

export function getPack(id: string): Pack | null {
	const cached = packCache.get(id);
	if (cached !== undefined) return cached;
	const file = resolve(PACKS_DIR, `${id}.json`);
	try {
		const pack = JSON.parse(readFileSync(file, 'utf-8')) as Pack;
		packCache.set(id, pack);
		return pack;
	} catch {
		return null;
	}
}
