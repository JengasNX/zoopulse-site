import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  kind: string;
  goal: string;
  excerpt: string;
  body: string;
  minutes: number;
}

const blogDir = path.join(process.cwd(), "src", "content", "blog");

function parseFrontMatter(raw: string): { meta: Record<string, string>; body: string } {
  raw = raw.replace(/\r\n?/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: match[2] };
}

function firstParagraph(body: string): string {
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("#"));
  return (paragraphs[0] ?? "").replace(/[#*_>]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

function kindLabel(meta: Record<string, string>): string {
  const map: Record<string, string> = {
    "статья-гайд": "Гайд",
    "статья-инструкция": "Инструкция",
    "статья-разбор": "Разбор",
    "статья-чек-лист": "Чек-лист",
    эссе: "Эссе",
    "статья-кейс": "Кейс",
    "статья-метод": "Метод",
    "статья-инсайт": "Идея",
  };
  return map[meta.format] ?? meta.format ?? "Статья";
}

function readingMinutes(body: string): number {
  const words = body.split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(blogDir)) return [];
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md")).sort();
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
    const { meta, body } = parseFrontMatter(raw);
    const title = (body.match(/^# (.+)$/m)?.[1] ?? meta.title ?? file).trim();
    return {
      slug: file.replace(/\.md$/, ""),
      title,
      kind: kindLabel(meta),
      goal: meta.goal ?? "",
      excerpt: firstParagraph(body),
      body,
      minutes: readingMinutes(body),
    };
  });
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
