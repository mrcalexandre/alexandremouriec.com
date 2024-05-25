import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
const parser = new MarkdownIt();

export async function GET(context) {
  const blog = await getCollection('posts');
  return rss({
    title: 'Alexandre Mouriec',
    description: 'A blog',
    site: context.site,
    stylesheet: '/rss/pretty-feed-v3.xsl',
    items: blog.map((post) => ({
      link: `/blog/${post.slug}/`,
      // Note: this will not process components or JSX expressions in MDX files.
      content: sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
      }),
      ...post.data,
    })),
  });
}
