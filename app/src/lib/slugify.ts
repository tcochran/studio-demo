/**
 * Converts a string to a URL slug.
 * - Lowercase the text
 * - Replace spaces with hyphens
 * - Strip out any character that is not a lowercase letter, digit, or hyphen
 * - Collapse consecutive hyphens into one
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '-')
		.replace(/\s+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-+/g, '-');
}