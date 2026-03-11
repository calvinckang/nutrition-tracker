/**
 * Format number for display: trim trailing zeros (§5.6).
 * Whole numbers: 12 not 12.00; one decimal when needed: 12.5; two when needed: 12.34.
 */
export function formatNumber(value: number | string | null | undefined): string {
	if (value === null || value === undefined) return '';
	const n = typeof value === 'string' ? parseFloat(value) : value;
	if (Number.isNaN(n)) return '';
	return Number(n) === Math.round(n) ? String(Math.round(n)) : String(Number(n));
}

/** Round to 2 decimal places for storage/validation (§5.6). */
export function roundTo2(value: number | string): number {
	const n = typeof value === 'string' ? parseFloat(value) : value;
	if (Number.isNaN(n)) return 0;
	return Math.round(n * 100) / 100;
}
