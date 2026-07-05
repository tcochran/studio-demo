export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
}
