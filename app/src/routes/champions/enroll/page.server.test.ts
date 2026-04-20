import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';

const mockChampions = [
	{
		id: 'ch-001',
		name: 'Existing Champion',
		title: 'Engineer',
		location: 'NYC',
		skills: ['Python'],
		achievements: [],
		bio: 'Test bio.',
		contact: 'existing@example.com',
		joinedDate: '2025-09-15'
	}
];

let writtenData: string | null = null;

vi.mock('fs', () => ({
	readFileSync: vi.fn(() => JSON.stringify(mockChampions)),
	writeFileSync: vi.fn((_path: string, data: string) => {
		writtenData = data;
	})
}));

vi.mock('path', () => ({
	resolve: vi.fn((...args: string[]) => args.join('/'))
}));

vi.mock('@sveltejs/kit', () => ({
	fail: (status: number, data: any) => ({ status, data }),
	redirect: (status: number, location: string) => {
		throw { status, location };
	}
}));

function createFormData(fields: Record<string, string | string[]>): FormData {
	const formData = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		if (Array.isArray(value)) {
			for (const v of value) {
				formData.append(key, v);
			}
		} else {
			formData.append(key, value);
		}
	}
	return formData;
}

function createRequest(fields: Record<string, string | string[]>): Request {
	const formData = createFormData(fields);
	return { formData: () => Promise.resolve(formData) } as unknown as Request;
}

const validFields = {
	name: 'Jane Doe',
	title: 'AI Engineer',
	location: 'Austin, TX',
	bio: 'Passionate about AI.',
	contact: 'jane@example.com',
	skills: ['Python', 'Machine Learning']
};

describe('Enrollment load', () => {
	it('returns available skills list', () => {
		const result = load();
		expect(result.availableSkills).toContain('Python');
		expect(result.availableSkills).toContain('AI Ethics');
		expect(result.availableSkills).toContain('Prompt Engineering');
		expect(result.availableSkills.length).toBe(13);
	});
});

describe('Enrollment form action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		writtenData = null;
	});

	it('creates a new champion with valid data', async () => {
		const request = createRequest(validFields);
		try {
			await actions.default({ request } as any);
		} catch (e: any) {
			expect(e.status).toBe(303);
			expect(e.location).toBe('/champions');
		}

		const written = JSON.parse(writtenData!);
		expect(written).toHaveLength(2);
		const newChampion = written[1];
		expect(newChampion.name).toBe('Jane Doe');
		expect(newChampion.title).toBe('AI Engineer');
		expect(newChampion.location).toBe('Austin, TX');
		expect(newChampion.skills).toEqual(['Python', 'Machine Learning']);
		expect(newChampion.id).toBe('ch-002');
		expect(newChampion.achievements).toEqual([]);
		expect(newChampion.joinedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('trims whitespace from input fields', async () => {
		const request = createRequest({
			...validFields,
			name: '  Jane Doe  ',
			title: '  AI Engineer  '
		});
		try {
			await actions.default({ request } as any);
		} catch {
			// redirect expected
		}

		const written = JSON.parse(writtenData!);
		expect(written[1].name).toBe('Jane Doe');
		expect(written[1].title).toBe('AI Engineer');
	});

	it('returns error when name is missing', async () => {
		const request = createRequest({ ...validFields, name: '' });
		const result = await actions.default({ request } as any);
		expect(result.status).toBe(400);
		expect(result.data.errors.name).toBe('Name is required');
	});

	it('returns error when title is missing', async () => {
		const request = createRequest({ ...validFields, title: '' });
		const result = await actions.default({ request } as any);
		expect(result.status).toBe(400);
		expect(result.data.errors.title).toBe('Title is required');
	});

	it('returns error when location is missing', async () => {
		const request = createRequest({ ...validFields, location: '' });
		const result = await actions.default({ request } as any);
		expect(result.status).toBe(400);
		expect(result.data.errors.location).toBe('Location is required');
	});

	it('returns error when bio is missing', async () => {
		const request = createRequest({ ...validFields, bio: '' });
		const result = await actions.default({ request } as any);
		expect(result.status).toBe(400);
		expect(result.data.errors.bio).toBe('Bio is required');
	});

	it('returns error when contact email is missing', async () => {
		const request = createRequest({ ...validFields, contact: '' });
		const result = await actions.default({ request } as any);
		expect(result.status).toBe(400);
		expect(result.data.errors.contact).toBe('Contact email is required');
	});

	it('returns error for invalid email format', async () => {
		const request = createRequest({ ...validFields, contact: 'not-an-email' });
		const result = await actions.default({ request } as any);
		expect(result.status).toBe(400);
		expect(result.data.errors.contact).toBe('Please enter a valid email address');
	});

	it('returns error when no skills are selected', async () => {
		const fields = { ...validFields };
		delete (fields as any).skills;
		const request = createRequest(fields);
		const result = await actions.default({ request } as any);
		expect(result.status).toBe(400);
		expect(result.data.errors.skills).toBe('Select at least one skill');
	});

	it('returns multiple errors for multiple missing fields', async () => {
		const request = createRequest({ name: '', title: '', location: '', bio: '', contact: '' });
		const result = await actions.default({ request } as any);
		expect(result.status).toBe(400);
		expect(Object.keys(result.data.errors).length).toBeGreaterThanOrEqual(5);
	});

	it('preserves form values on validation failure', async () => {
		const request = createRequest({ ...validFields, contact: 'bad-email' });
		const result = await actions.default({ request } as any);
		expect(result.data.values.name).toBe('Jane Doe');
		expect(result.data.values.title).toBe('AI Engineer');
		expect(result.data.values.location).toBe('Austin, TX');
		expect(result.data.values.bio).toBe('Passionate about AI.');
	});

	it('generates correct ID based on existing champions count', async () => {
		const request = createRequest(validFields);
		try {
			await actions.default({ request } as any);
		} catch {
			// redirect expected
		}

		const written = JSON.parse(writtenData!);
		expect(written[1].id).toBe('ch-002');
	});

	it('redirects to /champions after successful enrollment', async () => {
		const request = createRequest(validFields);
		await expect(actions.default({ request } as any)).rejects.toMatchObject({
			status: 303,
			location: '/champions'
		});
	});

	it('does not write to file on validation failure', async () => {
		const { writeFileSync } = await import('fs');
		const request = createRequest({ ...validFields, name: '' });
		await actions.default({ request } as any);
		expect(writeFileSync).not.toHaveBeenCalled();
	});
});
