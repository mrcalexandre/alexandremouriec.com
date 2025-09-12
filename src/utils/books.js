import { getCollection } from "astro:content";

export async function getBooksData() {
  const books = await getCollection("books");

  // Separate currently reading books
  const currentlyReading = books.filter(
    (book) => book.data.currently_reading === true
  );

  const readBooks = books.filter((book) => !book.data.currently_reading);

  // Group read books by year
  const booksByYear = readBooks.reduce((acc, book) => {
    if (book.data.date_read) {
      const year = new Date(book.data.date_read).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      // Keep the full entry so we keep access to id for linking
      acc[year].push(book);
    }
    return acc;
  }, {});

  // Sort books within each year
  Object.values(booksByYear).forEach((yearBooks) => {
    yearBooks.sort((a, b) => {
      const dateA = a.data.date_read ? new Date(a.data.date_read).valueOf() : 0;
      const dateB = b.data.date_read ? new Date(b.data.date_read).valueOf() : 0;
      return dateB - dateA;
    });
  });

  const sortedYears = Object.keys(booksByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return {
    booksByYear,
    currentlyReading,
    sortedYears,
  };
}
