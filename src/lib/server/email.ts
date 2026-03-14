import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

/** Send an email via Resend. No-ops if RESEND_API_KEY is not set (e.g. dev or missing in production). */
export async function sendEmail(options: {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}) {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn(
			'[email] RESEND_API_KEY not set; skipping send. Set it in Netlify (Site settings → Environment variables) for production.',
			options.to,
			options.subject
		);
		return { error: new Error('RESEND_API_KEY not set') };
	}
	const resend = new Resend(apiKey);
	const from = env.EMAIL_FROM ?? 'Nutrimaxxing <onboarding@resend.dev>';
	const { data, error } = await resend.emails.send({
		from,
		to: options.to,
		subject: options.subject,
		text: options.text ?? options.html ?? ''
	});
	if (error) {
		console.error('[email] Resend error:', error.message ?? error, 'to:', options.to, 'subject:', options.subject);
		return { error };
	}
	return { error: null, data };
}
