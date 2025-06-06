import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const books = await getCollection("books");
  
  // Filter out currently reading books and sort by date_read
  const readBooks = books
    .filter((book) => !book.data.currently_reading)
    .sort((a, b) => {
      const dateA = a.data.date_read ? new Date(a.data.date_read).valueOf() : 0;
      const dateB = b.data.date_read ? new Date(b.data.date_read).valueOf() : 0;
      return dateB - dateA;
    });

  return rss({
    description: "Books I've read",
    items: readBooks.map((book) => {
      // Ensure we have all required fields
      if (!book.data.title || !book.data.link || !book.data.date_read) {
        return null;
      }

      return {
        title: book.data.title,
        link: book.data.link,
        pubDate: new Date(book.data.date_read),
        description: `I read "${book.data.title}" by ${book.data.author}`,
        content: `
          <div class="book-entry">
            <img 
              src="${book.data.cover_image.cover_image_url}" 
              alt="${book.data.cover_image.cover_image_alt}" 
              class="book-cover"
            />
            <div class="book-details">
              <h2>${book.data.title}</h2>
              <p>by ${book.data.author}</p>
              <p>Read on ${new Date(book.data.date_read).toLocaleDateString()}</p>
            </div>
          </div>
        `,
      };
    }).filter(Boolean), // Remove any null entries
    site: context.site,
    stylesheet: "/rss/rss-style.xsl",
    title: "Alexandre Mouriec's Bookshelf",
    trailingSlash: false
  });
} 