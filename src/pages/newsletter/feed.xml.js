import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const parser = new MarkdownIt();

export async function GET(context) {
  const newsletters = await getCollection("newsletters");
  
  // Sort newsletters by publication date (newest first)
  const sortedNewsletters = newsletters.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: "Full-Time Curious - Newsletter by Alexandre Mouriec",
    description: "A monthly curated newsletter about what I've been reading, watching, and thinking about.",
    site: context.site,
    items: sortedNewsletters.map((newsletter) => ({
      title: newsletter.data.title,
      pubDate: newsletter.data.pubDate,
      description: newsletter.data.description,
      content: sanitizeHtml(parser.render(newsletter.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      }) + "<p>Thank you for using RSS to follow this newsletter. You are taking control of what you consume.</p>",
      link: `/newsletter/${newsletter.slug}/`,
      author: newsletter.data.author,
    })),
    stylesheet: "/rss/rss-style.xsl",
    trailingSlash: false
  });
}
