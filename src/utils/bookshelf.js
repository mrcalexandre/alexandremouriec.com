import fs from "fs";
import fetch from "node-fetch";
import xml2js from "xml2js";

async function getGoodreadsBooks() {
    // Goodreads RSS feed URL with your user ID and API key
    const url = "https://www.goodreads.com/review/list_rss/51626532?key=DLQz_TdaH9a8JYqPbY9AV6UU-LPMXRtUBIxM2g9gXiNnLGSR&shelf=read";

    // Fetch the RSS feed data
    const response = await fetch(url);
    const xml = await response.text(); // Convert the response to text (XML format)

    // Parse the XML into a JavaScript object
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);

    // Ensure the directory exists
    const dir = "./src/content/books/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Map through each book item and save each as a separate JSON file
    result.rss.channel[0].item.forEach(book => {
        const bookData = {
            author: book.author_name[0], // Author name
            cover_image: book.book_large_image_url[0], // URL of the book's cover image
            date_read: book.user_read_at[0], // Date when the book was read
            link: book.link[0], // Link to the book on Goodreads
            title: book.title[0] // Book title
        };

        // Create a filename by sanitizing the book title
        const filename = `${bookData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;

        // Save the book data as a JSON file
        fs.writeFileSync(`${dir}/${filename}`, JSON.stringify(bookData, null, 2));
    });
}

// Execute the function and handle any errors
getGoodreadsBooks().catch(console.error);
