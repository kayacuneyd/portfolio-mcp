import nodemailer from 'nodemailer';
import { z } from 'zod';

const LeadSchema = z.object({
  name: z.string().max(120).optional(),
  email: z.string().email(),
  topic: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
});

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, '');
}

export async function createLead(payload: any) {
  const parsed = LeadSchema.safeParse({
    ...payload,
    name: payload?.name ? stripHtml(String(payload.name)) : undefined,
    topic: payload?.topic ? stripHtml(String(payload.topic)) : undefined,
    message: payload?.message ? stripHtml(String(payload.message)) : undefined,
  });
  if (!parsed.success) {
    throw new Error('Invalid lead payload');
  }
  const lead = parsed.data;

  const to = process.env.LEAD_MAIL_TO;
  if (!to) throw new Error('LEAD_MAIL_TO not set');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `New lead: ${lead.email}${lead.topic ? ' - ' + lead.topic : ''}`;
  const text = `Name: ${lead.name || '-'}\nEmail: ${lead.email}\nTopic: ${lead.topic || '-'}\nMessage:\n${lead.message || '-'}`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  });

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdAt: new Date().toISOString(),
          ...lead,
        }),
      });
    } catch (e) {
      // swallow webhook errors
    }
  }

  return { ok: true };
}
