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
      acc[year].push(book.data);
    }
    return acc;
  }, {});

  // Sort books within each year
  Object.values(booksByYear).forEach((yearBooks) => {
    yearBooks.sort((a, b) => {
      const dateA = a.date_read ? new Date(a.date_read).valueOf() : 0;
      const dateB = b.date_read ? new Date(b.date_read).valueOf() : 0;
      return dateB - dateA;
    });
  });

  const sortedYears = Object.keys(booksByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return {
    booksByYear,
    currentlyReading,
    sortedYears
  };
} 