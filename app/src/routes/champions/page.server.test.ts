import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';

const mockChampions = [
	{
		id: 'ch-001',
		name: 'Alice Smith',
		title: 'ML Engineer',
		location: 'New York, NY',
		skills: ['Python', 'Machine Learning'],
		achievements: ['Built ML pipeline'],
		bio: 'ML expert.',
		contact: 'alice@example.com',
		joinedDate: '2025-09-15'
	},
	{
		id: 'ch-002',
		name: 'Bob Jones',
		title: 'Data Scientist',
		location: 'San Francisco, CA',
		skills: ['Python', 'Data Analysis', 'NLP'],
		achievements: [],
		bio: 'Data enthusiast.',
		contact: 'bob@example.com',
		joinedDate: '2025-10-01'
	},
	{
		id: 'ch-003',
		name: 'Carol Lee',
		title: 'Tech Writer',
		location: 'New York, NY',
		skills: ['Documentation', 'AI Ethics'],
		achievements: ['Wrote AI guidelines'],
		bio: 'Documentation specialist.',
		contact: 'carol@example.com',
		joinedDate: '2025-11-10'
	}
];

vi.mock('fs', () => ({
	readFileSync: vi.fn(() => JSON.stringify(mockChampions))
}));

vi.mock('path', () => ({
	resolve: vi.fn((...args: string[]) => args.join('/'))
}));

describe('Champions directory loader', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns all champions', () => {
		const result = load();
		expect(result.champions).toHaveLength(3);
		expect(result.champions[0].name).toBe('Alice Smith');
	});

	it('extracts unique skills sorted alphabetically', () => {
		const result = load();
		expect(result.skills).toEqual([
			'AI Ethics',
			'Data Analysis',
			'Documentation',
			'Machine Learning',
			'NLP',
			'Python'
		]);
	});

	it('extracts unique locations sorted alphabetically', () => {
		const result = load();
		expect(result.locations).toEqual(['New York, NY', 'San Francisco, CA']);
	});

	it('deduplicates skills across champions', () => {
		const result = load();
		const pythonCount = result.skills.filter((s: string) => s === 'Python').length;
		expect(pythonCount).toBe(1);
	});

	it('deduplicates locations across champions', () => {
		const result = load();
		const nyCount = result.locations.filter((l: string) => l === 'New York, NY').length;
		expect(nyCount).toBe(1);
	});
});
