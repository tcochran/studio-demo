export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/ +/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-{2,}/g, '-')
		.replace(/^-|-$/g, '');
}
