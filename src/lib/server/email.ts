import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/** Send an email via Resend. No-ops if RESEND_API_KEY is not set (e.g. dev). */
export async function sendEmail(options: {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}) {
	if (!resend) {
		console.warn('[email] RESEND_API_KEY not set; skipping send:', options.to, options.subject);
		return { error: null };
	}
	const { error } = await resend.emails.send({
		from: env.EMAIL_FROM ?? 'Nutrition Tracker <onboarding@resend.dev>',
		to: options.to,
		subject: options.subject,
		text: options.text ?? options.html ?? ''
	});
	return { error };
}
