import { Resend } from "resend";
import type { JobApplication } from "@/lib/types";

const NOTIFY_EMAIL = "darren.olevson@qapital.com";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

export async function sendApplicationNotification(
  application: JobApplication,
): Promise<void> {
  const client = getResend();
  if (!client) return;

  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "notifications@resend.dev";

  const lines = [
    `<h2>New Application: ${application.jobTitle}</h2>`,
    `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">`,
    row("Name", application.fullName),
    row("Email", `<a href="mailto:${application.email}">${application.email}</a>`),
    row("Location", application.currentLocation),
    row("Company", application.currentCompany),
    row("Role Interest", application.roleInterest),
  ];

  if (application.referredBy) lines.push(row("Referred By", application.referredBy));
  if (application.linkedinUrl) lines.push(row("LinkedIn", link(application.linkedinUrl)));
  if (application.githubUrl) lines.push(row("GitHub", link(application.githubUrl)));
  if (application.portfolioUrl) lines.push(row("Portfolio", link(application.portfolioUrl)));
  if (application.resumeUrl) lines.push(row("Resume", link(application.resumeUrl)));

  lines.push(row("Submitted", new Date(application.submittedAt).toLocaleString()));
  lines.push(`</table>`);

  await client.emails.send({
    from: fromAddress,
    to: NOTIFY_EMAIL,
    subject: `New Application — ${application.jobTitle} — ${application.fullName}`,
    html: lines.join("\n"),
  });
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;">${label}</td><td style="padding:6px 0;">${value}</td></tr>`;
}

function link(url: string): string {
  return `<a href="${url}">${url}</a>`;
}
