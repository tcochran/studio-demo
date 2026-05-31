import { error } from '@sveltejs/kit';
import { getPack, listPacks } from '$lib/packs';

export function entries() {
	return listPacks().map((p) => ({ pack: p.id }));
}

export const prerender = true;

export function load({ params }) {
	const pack = getPack(params.pack);
	if (!pack) throw error(404, `Pack not found: ${params.pack}`);
	return { pack };
}
