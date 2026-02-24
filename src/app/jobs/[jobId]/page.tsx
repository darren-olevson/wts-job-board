import { notFound } from "next/navigation";
import { ReactNode } from "react";

import { JobDetailLayout } from "@/components/job-detail-layout";
import { DEFAULT_ABOUT_WTS, LEGACY_ABOUT_WTS } from "@/lib/constants/about-wts";
import { jobStore } from "@/lib/services";

type JobDetailPageProps = {
  params: Promise<{ jobId: string }>;
};

const ABOUT_WTS_BULLET_LABELS = new Set([
  "High impact",
  "Cross-functional",
  "Practical builders",
  "Mission-driven",
  "High ownership, high impact",
  "Cross-functional by default",
]);

function renderInlineFormatting(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(<strong key={`strong-${match.index}`}>{match[1]}</strong>);
    lastIndex = pattern.lastIndex;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderRichText(
  text: string,
  options?: { promoteColonLabelsToBullets?: Set<string> },
) {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  const bulletItems: string[] = [];
  const paragraphLines: string[] = [];

  const flushList = () => {
    if (bulletItems.length === 0) {
      return;
    }
    nodes.push(
      <ul key={`list-${nodes.length}`} className="list-disc space-y-1 pl-6">
        {bulletItems.map((item, index) => (
          <li key={`item-${index}`}>{renderInlineFormatting(item)}</li>
        ))}
      </ul>,
    );
    bulletItems.length = 0;
  };

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }
    nodes.push(
      <p key={`p-${nodes.length}`}>{renderInlineFormatting(paragraphLines.join(" "))}</p>,
    );
    paragraphLines.length = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // Treat only true list markers as bullets so markdown bold (`**text**`) remains intact.
    const bulletMatch = line.match(/^(?:[-•]\s+|\*\s+)(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      bulletItems.push(bulletMatch[1]);
      continue;
    }

    if (options?.promoteColonLabelsToBullets) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const label = line.slice(0, colonIndex).trim();
        if (options.promoteColonLabelsToBullets.has(label)) {
          const body = line.slice(colonIndex + 1).trim();
          flushParagraph();
          bulletItems.push(`**${label}:** ${body}`);
          continue;
        }
      }
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  return nodes;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;
  const jobs = await jobStore.list();
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  const savedAboutWts = job.aboutWts?.trim() ?? "";
  const aboutWts =
    !savedAboutWts || savedAboutWts === LEGACY_ABOUT_WTS
      ? DEFAULT_ABOUT_WTS
      : savedAboutWts;
  const aboutRole = job.aboutRole?.trim() || job.description?.trim() || "";

  return (
    <JobDetailLayout job={job} activeTab="description">
      <article className="space-y-10 text-sm leading-7 text-foreground/90">
        <section className="space-y-3">
          <h3 className="text-2xl font-semibold text-foreground">About WTS</h3>
          <div className="space-y-4">
            {renderRichText(aboutWts, {
              promoteColonLabelsToBullets: ABOUT_WTS_BULLET_LABELS,
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-2xl font-semibold text-foreground">About the Role</h3>
          <div className="space-y-4">{renderRichText(aboutRole)}</div>
        </section>
      </article>
    </JobDetailLayout>
  );
}
