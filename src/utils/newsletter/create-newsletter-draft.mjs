import fs from "fs";
import https from "https";
import path from "path";

// Utility functions
const fetchData = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });

const parseDate = (dateStr) => (dateStr ? new Date(dateStr) : null);
const isInMonth = (date, month, year) =>
  date && date.getMonth() === month - 1 && date.getFullYear() === year;

// Simple XML parser for RSS feed
const parseRssXml = (xml) => {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1];
    const title = entry.match(/<title>(.*?)<\/title>/)?.[1];
    const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*>/)?.[1];
    const content = entry.match(/<content[^>]*>(.*?)<\/content>/)?.[1] || "";
    const description =
      content.match(/class="markdown">(.*?)<\/div>/s)?.[1]?.trim() || "";

    if (published && title && link) {
      entries.push({ description, link, published, title });
    }
  }

  return entries;
};

// Fetch RSS feed entries for a specific month
const fetchRssFeed = async (url, month, year) => {
  try {
    const xml = await fetchData(url);
    const entries = parseRssXml(xml);

    return entries
      .map((entry) => {
        const publishedDate = parseDate(entry.published);
        if (!isInMonth(publishedDate, month, year)) return null;

        return {
          description: entry.description,
          link: entry.link,
          title: entry.title,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
};

// Get books read in a specific month
const getBooks = (month, year) => {
  try {
    const booksDir = "./src/content/books/";
    const bookFiles = fs
      .readdirSync(booksDir)
      .filter((file) => file.endsWith(".json"));

    return bookFiles
      .map((file) => {
        const bookData = JSON.parse(
          fs.readFileSync(path.join(booksDir, file), "utf8")
        );
        const readDate = parseDate(bookData.date_read);

        if (
          !readDate ||
          bookData.currently_reading ||
          !isInMonth(readDate, month, year)
        ) {
          return null;
        }

        return {
          author: bookData.author,
          cover_image: bookData.cover_image || {},
          date_read: readDate,
          title: bookData.title,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.date_read - a.date_read);
  } catch (error) {
    console.error("Error reading books:", error);
    return [];
  }
};

// Get articles published in a specific month
const getArticles = (month, year) => {
  try {
    const postsDir = "./src/content/posts/";
    const postFiles = fs
      .readdirSync(postsDir)
      .filter((file) => file.endsWith(".md"));

    return postFiles
      .map((file) => {
        const postContent = fs.readFileSync(path.join(postsDir, file), "utf8");
        const frontmatter = postContent.match(/^---\n([\s\S]*?)\n---/)?.[1];

        if (!frontmatter) return null;

        const pubDate = parseDate(
          frontmatter.match(/pubDate:\s*(.+)/)?.[1]?.trim()
        );
        if (!isInMonth(pubDate, month, year)) return null;

        return {
          description:
            frontmatter.match(/description:\s*(.+)/)?.[1]?.trim() || "",
          pubDate,
          slug: file.replace(".md", ""),
          title:
            frontmatter.match(/title:\s*(.+)/)?.[1]?.trim() ||
            file.replace(".md", ""),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.pubDate - a.pubDate);
  } catch (error) {
    console.error("Error reading articles:", error);
    return [];
  }
};

// Generate markdown content
const generateMarkdown = (month, year, links, books, articles) => {
  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const pubDate = new Date(year, month - 1, 1).toISOString();
  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const stripHtml = (html) =>
    (html || "")
      .trim()
      .replace(/<[^>]*>?/gm, "")
      .replace(/\n\s*/g, "\n");

  const sections = [
    `---
title: Full-Time Curious - ${monthName}
author: Alexandre Mouriec
pubDate: ${pubDate}
description: A monthly recap of what I've been reading, watching, and thinking about.
tags: ["newsletter", "monthly"]
---

## ✨ Highlights of the last month\n\n

---`,

    articles.length > 0
      ? `## ✍️ Articles I wrote this month\n\n${articles
          .map(
            (article) =>
              `### [${article.title}](/blog/${article.slug})\n\n${article.description ? `${article.description}\n\n` : ""}**Published:** ${formatDate(article.pubDate)}\n\n---\n`
          )
          .join("")}\n`
      : "",

    `## 📚 What I liked consuming the last month\n\n_Let's dive now into what I consumed the last month and especially liked_\n\n${links
      .map(
        (link) =>
          `### ${link.title}\nlink: ${link.link}\n\n${
            link.description
              ? `${stripHtml(link.description)}\n\n---\n`
              : "---\n"
          }`
      )
      .join("")}`,

    `## Books\n\n${books
      .map(
        (book) =>
          `### ${book.title}\n\nAuthor: ${book.author}\nRead: ${formatDate(book.date_read)}\n${
            book.cover_image?.cover_image_url
              ? `\nCover image: ${book.cover_image.cover_image_url}\n`
              : "\n"
          }---\n`
      )
      .join("")}`,

    `## 👀 What I'm up to the next month\n\n<!-- Add your future plans here -->\n\n---

> And that's it for this month's issue of Full-Time Curious 😁 If you enjoyed reading this issue, you can like this newsletter by clicking the ❤️ below, subscribe or respond to this email so we can chat.\n\n> Thanks for reading and see you next month!\n\n> **Alexandre**\n`,
  ];

  return sections.filter(Boolean).join("\n");
};

// Main function
const generateRecap = async (month) => {
  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }

  const year = new Date().getFullYear();
  const monthName = new Date(year, month - 1)
    .toLocaleString("default", { month: "long" })
    .toLowerCase();
  const outputFile = `./src/content/newsletter/${year}-${monthName}.md`;
  const rssUrl = "https://links.alexandremouriec.com/feed/atom";

  try {
    const [links, books, articles] = await Promise.all([
      fetchRssFeed(rssUrl, month, year),
      Promise.resolve(getBooks(month, year)),
      Promise.resolve(getArticles(month, year)),
    ]);

    const markdownContent = generateMarkdown(
      month,
      year,
      links,
      books,
      articles
    );
    fs.writeFileSync(outputFile, markdownContent);
    console.log(`File ${outputFile} created successfully!`);
  } catch (error) {
    console.error("Error generating recap:", error);
    process.exit(1);
  }
};

// CLI
// Supports: `-m=8`, `-m 8`, `--month=8`, and npm's `npm_config_m` env (from `npm run ... -m=8`)
const getMonthFromArgs = () => {
  const args = process.argv.slice(2);

  // Try common flag formats
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith("-m=")) return parseInt(arg.split("=")[1], 10);
    if (arg === "-m") return parseInt(args[i + 1], 10);
    if (arg.startsWith("--month=")) return parseInt(arg.split("=")[1], 10);
  }

  // Fallback to npm's env var when using `npm run` without `--`
  const fromEnv = process.env.npm_config_m || process.env.npm_config_month;
  if (fromEnv) return parseInt(fromEnv, 10);

  return NaN;
};

const month = getMonthFromArgs();

if (Number.isNaN(month) || month < 1 || month > 12) {
  console.error(
    "Please specify a valid month (1-12). Examples: -m=3, -m 3, --month=3. If using npm run, prefer: npm run newsletter:create-draft -- -m=3"
  );
  process.exit(1);
}

generateRecap(month);
