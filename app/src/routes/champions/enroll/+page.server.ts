import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fail, redirect } from '@sveltejs/kit';

const SKILLS = [
	'AI Ethics',
	'AI Strategy',
	'AI-Assisted Coding',
	'Cloud Architecture',
	'Data Analysis',
	'Documentation',
	'LLM APIs',
	'Machine Learning',
	'NLP',
	'Product',
	'Prompt Engineering',
	'Python',
	'TypeScript'
];

export function load() {
	return { availableSkills: SKILLS };
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString().trim() ?? '';
		const title = formData.get('title')?.toString().trim() ?? '';
		const location = formData.get('location')?.toString().trim() ?? '';
		const bio = formData.get('bio')?.toString().trim() ?? '';
		const contact = formData.get('contact')?.toString().trim() ?? '';
		const skills = formData.getAll('skills').map((s) => s.toString());

		const errors: Record<string, string> = {};
		if (!name) errors.name = 'Name is required';
		if (!title) errors.title = 'Title is required';
		if (!location) errors.location = 'Location is required';
		if (!bio) errors.bio = 'Bio is required';
		if (!contact) errors.contact = 'Contact email is required';
		if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
			errors.contact = 'Please enter a valid email address';
		}
		if (skills.length === 0) errors.skills = 'Select at least one skill';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: { name, title, location, bio, contact, skills } });
		}

		const file = resolve('src/lib/data/champions.json');
		const champions = JSON.parse(readFileSync(file, 'utf-8'));

		const newChampion = {
			id: `ch-${String(champions.length + 1).padStart(3, '0')}`,
			name,
			title,
			location,
			skills,
			achievements: [],
			bio,
			contact,
			joinedDate: new Date().toISOString().split('T')[0]
		};

		champions.push(newChampion);
		writeFileSync(file, JSON.stringify(champions, null, 2) + '\n');

		redirect(303, '/champions');
	}
};
