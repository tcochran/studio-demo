import { readFileSync } from 'fs';
import { resolve } from 'path';

export function load() {
	const file = resolve('src/lib/data/champions.json');
	const champions = JSON.parse(readFileSync(file, 'utf-8'));

	const skills = [...new Set(champions.flatMap((c: any) => c.skills))].sort();
	const locations = [...new Set(champions.map((c: any) => c.location))].sort();

	return { champions, skills, locations };
}
