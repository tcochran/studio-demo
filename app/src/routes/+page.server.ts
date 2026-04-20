import { readFileSync } from 'fs';
import { resolve } from 'path';

export function load() {
	const file = resolve('src/lib/data/trainings.json');
	const trainings = JSON.parse(readFileSync(file, 'utf-8'));
	return { trainings };
}
