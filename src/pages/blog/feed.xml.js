import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const parser = new MarkdownIt();

export async function GET(context) {
  const blog = await getCollection("posts");
  return rss({
    description: "A personal blog by Alexandre Mouriec on various topics",
    items: blog.map((post) => ({
      content:
        sanitizeHtml(parser.render(post.body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        }) +
        "<p>Thank you for using RSS to follow this blog. You are taking control of what you consume.</p>",
      link: `/blog/${post.slug}/`,
      ...post.data,
    })),
    site: context.site,
    stylesheet: "/rss/rss-style.xsl",
    title: "Alexandre Mouriec",
    trailingSlash: false,
  });
}
