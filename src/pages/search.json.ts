import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getStaticPaths } from "astro:content";

export const GET: APIRoute = async () => {
  try {
    const searchIndex = [];

    // Get all posts
    const posts = await getCollection("posts");
    for (const post of posts) {
      searchIndex.push({
        title: post.data.title,
        desc: post.data.description,
        section: "Blog",
        date: post.data.pubDate.toISOString().split('T')[0],
        permalink: `/blog/${post.slug}`,
        tags: post.data.tags || [],
        type: "post"
      });
    }

    // Get all books
    const books = await getCollection("books");
    for (const book of books) {
      searchIndex.push({
        title: book.data.title,
        desc: `by ${book.data.author}`,
        section: "Books",
        date: book.data.date_read || "",
        permalink: `/books/${book.id}`,
        tags: [],
        type: "book"
      });
    }

    // Add static pages
    const staticPages = [
      {
        title: "About",
        desc: "Learn more about Alexandre Mouriec",
        section: "Pages",
        date: "",
        permalink: "/about",
        tags: [],
        type: "page"
      },
      {
        title: "Work",
        desc: "My work experience and career",
        section: "Pages",
        date: "",
        permalink: "/work",
        tags: [],
        type: "page"
      },
      {
        title: "Projects",
        desc: "Projects I have built over the years",
        section: "Pages",
        date: "",
        permalink: "/projects",
        tags: [],
        type: "page"
      },
      {
        title: "Books",
        desc: "Books I have read and am currently reading",
        section: "Pages",
        date: "",
        permalink: "/books",
        tags: [],
        type: "page"
      },
      {
        title: "Blog",
        desc: "My thoughts and writings",
        section: "Pages",
        date: "",
        permalink: "/blog",
        tags: [],
        type: "page"
      },
      {
        title: "Uses",
        desc: "Tools and software I use",
        section: "Pages",
        date: "",
        permalink: "/uses",
        tags: [],
        type: "page"
      },
      {
        title: "Now",
        desc: "What I'm currently working on",
        section: "Pages",
        date: "",
        permalink: "/now",
        tags: [],
        type: "page"
      },
      {
        title: "Defaults",
        desc: "My default settings and preferences",
        section: "Pages",
        date: "",
        permalink: "/defaults",
        tags: [],
        type: "page"
      },
      {
        title: "Contact",
        desc: "Get in touch with me",
        section: "Pages",
        date: "",
        permalink: "/contact",
        tags: [],
        type: "page"
      },
      {
        title: "Feeds",
        desc: "RSS and Atom feeds for my content",
        section: "Pages",
        date: "",
        permalink: "/feeds",
        tags: [],
        type: "page"
      }
    ];

    searchIndex.push(...staticPages);

    return new Response(JSON.stringify(searchIndex), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating search index:", error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
