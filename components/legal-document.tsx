import Link from "next/link";
import { cn } from "@/lib/utils";

function isBulletLine(line: string): boolean {
  return /^[\t ]*•[\t ]+.+$/.test(line);
}

function bulletText(line: string): string {
  return line.replace(/^[\t ]*•[\t ]+/, "").trim();
}

function isSubsectionHeading(line: string): boolean {
  const t = line.trim();
  return /^\d+\.\d+(?:\.\d+)?\s+[A-Za-z]/.test(t);
}

/** Main numbered section heading: `23. ACCOUNT` … not `23.44` decimals or `23. INTRODUCTION` sub as 23. only */
function isMainSectionHeading(line: string): boolean {
  const t = line.trim();
  if (/^\d+\.\d+/.test(t)) return false;
  return /^\d+\.\s+[A-Za-z\d]/.test(t);
}

/**
 * Untitled subtitles under umbrella sections (e.g. Severability · No Waiver in Terms §32).
 * Must not collide with bullets or numbered headings.
 */
function isStandaloneSubtitle(line: string, prevLineWasEmpty: boolean): boolean {
  const t = line.trim();
  if (!t.length || t.length > 48) return false;
  if (!prevLineWasEmpty) return false;
  if (/^[\t ]*•/.test(line)) return false;
  if (/^\d+\./.test(t)) return false;
  if (/[.;:]$/.test(t)) return false;
  if (/^[a-z]/.test(t)) return false;
  if (/^\d/.test(t)) return false;
  /* e.g. Severability · No Waiver · Language */
  return /^([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)*$/.test(t);
}

/** Obvious shouting legal disclaimers rendered with emphasis — short circuit false positives elsewhere */
function looksLikeDisclaimerShout(trimmed: string): boolean {
  if (trimmed.length < 42) return false;
  let upper = 0;
  let letters = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (/[A-Z]/.test(c)) upper++;
    if (/[a-zA-Z]/.test(c)) letters++;
  }
  return letters > 28 && upper / letters > 0.85;
}

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "p"; text: string; shout: boolean }
  | { type: "ul"; items: string[] };

/**
 * Parses the plain-text dumps from DOCX exports into readable blocks for static pages.
 */
function parseLegalBody(lines: string[], startIdx: number): Block[] {
  const blocks: Block[] = [];
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const prevEmpty = !lines[i - 1]?.trim();

    if (isBulletLine(line)) {
      const items: string[] = [bulletText(line)];
      i += 1;
      while (i < lines.length && isBulletLine(lines[i])) {
        items.push(bulletText(lines[i]));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (isStandaloneSubtitle(line, prevEmpty)) {
      blocks.push({ type: "h4", text: trimmed });
      i += 1;
      continue;
    }

    if (isSubsectionHeading(trimmed)) {
      blocks.push({ type: "h3", text: trimmed });
      i += 1;
      continue;
    }

    if (isMainSectionHeading(trimmed)) {
      blocks.push({ type: "h2", text: trimmed });
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isBulletLine(lines[i]) &&
      !isStandaloneSubtitle(lines[i], !lines[i - 1]?.trim()) &&
      !isSubsectionHeading(lines[i]) &&
      !isMainSectionHeading(lines[i])
    ) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }

    const text = paragraphLines.join(" ");
    blocks.push({
      type: "p",
      text,
      shout: looksLikeDisclaimerShout(text),
    });
  }

  return blocks;
}

/** Extract title, meta line(s), IMPORTANT block, numbered body starts at first `\d+. WORD` heading */
function sliceDocument(raw: string): {
  title: string;
  effectiveLine?: string;
  noticeLines?: string[];
  bodyStartIdx: number;
  lines: string[];
} {
  const lines = raw.split(/\r?\n/);

  let title = "Savvari";
  if (lines[0]?.trim()) title = lines[0].trim();

  const effectiveLine = lines.find((l) =>
    /^effective date:/i.test(l.trim()),
  );

  let bodyStartIdx = lines.findIndex((l) => isMainSectionHeading(l.trim()) && /^1\.\s+/.test(l.trim()));
  if (bodyStartIdx < 0) {
    bodyStartIdx = lines.findIndex((l) => isMainSectionHeading(l.trim()));
  }
  if (bodyStartIdx < 0) bodyStartIdx = 0;

  const noticeStart = lines.findIndex((l) => l.includes("IMPORTANT NOTICE"));
  let noticeLines: string[] | undefined;
  if (noticeStart >= 0 && noticeStart + 1 < bodyStartIdx) {
    noticeLines = lines.slice(noticeStart + 1, bodyStartIdx).filter((l, k, arr) => {
      if (!l.trim() && !(arr[k + 1] ?? "").trim()) return false;
      return true;
    });
    noticeLines = noticeLines.map((l) => l.trim()).filter(Boolean);
  }

  return { title, effectiveLine, noticeLines, bodyStartIdx, lines };
}

export function sanitizeLegalPlaceholders(s: string): string {
  return s
    .replace(/\[INSERT DATE\]/gi, "To be published")
    .replace(/\[INSERT LEGAL COMPANY NAME\]/gi, "[Company name — to be filed]")
    .replace(/\[INSERT NUMBER\]/gi, "—")
    .replace(/\[INSERT REGISTERED ADDRESS\]/gi, "[Registered office address]");
}

/** Renders markdown-free plain legal text exported from DOCX (.txt sibling files). */
export function LegalPlainDocument({
  raw,
  backHref = "/",
  backLabel = "← Savvari home",
}: {
  raw: string;
  backHref?: string;
  backLabel?: string;
}) {
  const { title, effectiveLine, noticeLines, bodyStartIdx, lines } = sliceDocument(raw);
  const blocks = parseLegalBody(lines, bodyStartIdx);
  const firstSectionIdx = blocks.findIndex((x) => x.type === "h2");

  return (
    <article className="legal-doc text-foreground pb-24">
      <nav className="text-muted-foreground mb-12 text-xs font-medium uppercase tracking-wider">
        <Link href={backHref} className="text-accent underline-offset-4 hover:underline">
          {backLabel}
        </Link>
      </nav>

      <header className="border-border mb-12 border-b pb-12">
        <h1 className="font-heading text-foreground mb-6 text-[clamp(1.875rem,4vw,2.5rem)] font-normal tracking-tight">
          {sanitizeLegalPlaceholders(title)}
        </h1>
        <p className="text-muted-foreground text-sm italic">
          {effectiveLine ? sanitizeLegalPlaceholders(effectiveLine.replace(/^effective date:\s*/i, "Effective date: ")) : null}
        </p>
      </header>

      {noticeLines?.length ? (
        <aside
          aria-label="Important notice"
          className="border-border bg-muted/30 mb-16 rounded-xl border px-6 py-5 text-sm shadow-sm backdrop-blur-sm"
        >
          <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#a8864a]">Important notice</p>
          <div className="text-muted-foreground space-y-3 leading-relaxed">
            {noticeLines.map((l, noticeIdx) => (
              <p key={`notice-${noticeIdx}`}>{sanitizeLegalPlaceholders(l)}</p>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="space-y-0">
        {blocks.map((b, idx) => {
          if (b.type === "h2") {
            return (
              <h2
                key={`h2-${idx}`}
                className={cn(
                  "font-heading text-foreground mb-5 border-border text-xl font-semibold tracking-tight md:text-[1.35rem]",
                  idx === firstSectionIdx ? "mt-0 border-t-0 pt-0" : "mt-16 border-t pt-14",
                )}
              >
                {sanitizeLegalPlaceholders(b.text)}
              </h2>
            );
          }
          if (b.type === "h3") {
            return (
              <h3 key={`h3-${idx}`} className="text-foreground mt-9 mb-3 text-[1.0625rem] font-semibold">
                {sanitizeLegalPlaceholders(b.text)}
              </h3>
            );
          }
          if (b.type === "h4") {
            return (
              <h4 key={`h4-${idx}`} className="text-foreground mt-10 mb-2 text-[15px] font-semibold">
                {sanitizeLegalPlaceholders(b.text)}
              </h4>
            );
          }
          if (b.type === "ul") {
            return (
              <ul
                key={`ul-${idx}`}
                className="border-accent/35 mb-10 list-none space-y-2 rounded-lg border bg-accent/[0.05] px-5 py-4"
              >
                {b.items.map((it, j) => (
                  <li
                    key={`${idx}-${j}`}
                    className="text-muted-foreground relative pl-4 text-[14px] leading-relaxed md:text-[15px]"
                  >
                    <span aria-hidden className="bg-accent absolute left-0 top-[0.6em] h-1.5 w-1.5 rounded-full" />
                    {sanitizeLegalPlaceholders(it)}
                  </li>
                ))}
              </ul>
            );
          }

          /* paragraph */
          const text = sanitizeLegalPlaceholders(b.text);
          return (
            <p
              key={`p-${idx}`}
              className={
                b.shout
                  ? "text-foreground mb-6 text-[13px] font-semibold uppercase leading-snug tracking-wide md:text-[14px]"
                  : "text-muted-foreground mb-6 text-[15px] leading-[1.7] md:text-[16px]"
              }
            >
              {text}
            </p>
          );
        })}
      </div>
    </article>
  );
}
