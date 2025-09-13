#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RSS_URL =
  process.env.BUTTONDOWN_RSS_URL ||
  "https://buttondown.com/fulltimecurious/rss";
const PROJECT_ROOT = join(__dirname, "..", "..");
const CONTENT_DIR = join(PROJECT_ROOT, "src", "content", "posts");

async function ensureDir(path) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

function isoToDateString(iso) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function parseRssItems(xml) {
  // minimal RSS parsing: split by <item> ... </item>
  const items = [];
  const itemRegex = /<item>[\s\S]*?<\/item>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const linkRegex = /<link>([\s\S]*?)<\/link>/;
  const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
  const descRegex = /<description>([\s\S]*?)<\/description>/;
  const contentRegex = /<content:encoded>([\s\S]*?)<\/content:encoded>/;
  const authorRegex = /<dc:creator>([\s\S]*?)<\/dc:creator>/;

  const entitiesDecode = (str) =>
    str
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

  for (const raw of xml.match(itemRegex) || []) {
    const link = (raw.match(linkRegex)?.[1] || "").trim();
    const title = (raw.match(titleRegex)?.[1] || "").trim();
    const author = (raw.match(authorRegex)?.[1] || "Alexandre Mouriec").trim();
    const description = entitiesDecode(
      (raw.match(descRegex)?.[1] || "").trim()
    );
    const pubDate = (raw.match(pubDateRegex)?.[1] || "").trim();
    const contentEncoded = entitiesDecode(
      (raw.match(contentRegex)?.[1] || "").trim()
    );
    const pubDateMs = new Date(pubDate).getTime();
    items.push({
      author,
      description,
      html: contentEncoded,
      link,
      pubDate,
      pubDateMs: isNaN(pubDateMs) ? 0 : pubDateMs,
      title,
    });
  }
  return items;
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function sync() {
  await ensureDir(CONTENT_DIR);

  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`Failed to fetch RSS: ${res.status}`);
  const xml = await res.text();

  const items = parseRssItems(xml).sort((a, b) => b.pubDateMs - a.pubDateMs);

  for (const item of items) {
    const slug =
      slugify(item.title) ||
      slugify(item.link.split("/").filter(Boolean).pop() || "newsletter");
    const html = item.html;

    const frontmatter =
      `---\n` +
      `title: ${JSON.stringify(item.title)}\n` +
      `author: ${JSON.stringify(item.author || "Alexandre Mouriec")}\n` +
      `pubDate: ${JSON.stringify(isoToDateString(item.pubDate))}\n` +
      `description: ${JSON.stringify(item.description)}\n` +
      `tags: []\n` +
      `---\n\n`;

    const body = `${html}\n`;
    const mdPath = join(CONTENT_DIR, `${slug}.md`);
    const nextContent = frontmatter + body;
    let shouldWrite = true;
    if (existsSync(mdPath)) {
      try {
        const current = await readFile(mdPath, "utf8");
        if (current === nextContent) {
          shouldWrite = false;
        }
      } catch {
        // fall through to write
      }
    }
    if (shouldWrite) {
      await writeFile(mdPath, nextContent, "utf8");
      console.log(`Synced: ${slug}`);
    } else {
      console.log(`Unchanged: ${slug}`);
    }
  }
}

sync().catch((err) => {
  console.error(err);
  process.exit(1);
});
