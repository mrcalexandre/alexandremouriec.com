import fs from "fs";
import fetch from "node-fetch";
import xml2js from "xml2js";

// Define a function to replace accented characters with unaccented ones
function normalizeString(str) {
    const accents = {
        "À": "A", "Ç": "C", "È": "E", "É": "E", "Ê": "E",
        "Ë": "E", "Î": "I", "Ï": "I", "Ô": "O", "Ö": "O",
        "Ù": "U", "Û": "U", "Ü": "U", "à": "a",
        "ç": "c", "è": "e", "é": "e", "ê": "e", "ë": "e",
        "î": "i", "ï": "i", "ô": "o", "ö": "o", "ù": "u",
        "û": "u", "ü": "u", "ÿ": "y", "Ÿ": "Y"
    };

    return str.split("").map(char => accents[char] || char).join("");
}

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
        const description = book.description[0];
        // Use regex to extract the book URL from the description
        const urlMatch = description.match(/<a href="(https:\/\/www\.goodreads\.com\/book\/show\/\d+\.([^"]+))"/);
        let bookUrl = urlMatch ? urlMatch[1] : book.link[0]; // Extracted URL or review link

        const bookData = {
            author: book.author_name[0],
            cover_image: {
                cover_image_alt: book.book_large_image_alt ? book.book_large_image_alt[0] : "",
                cover_image_url: book.book_large_image_url[0],
            },
            date_read: book.user_read_at[0],
            link: bookUrl,
            title: book.title[0]
        };

        // Normalize and sanitize the book title for filename
        let normalizedTitle = normalizeString(bookData.title);
        normalizedTitle = normalizedTitle.replace(/[^a-z0-9]+/gi, "_") // Replace non-alphanumeric characters with a single underscore
            .replace(/_{2,}/g, "_"); // Remove duplicate underscores
        const filename = `${normalizedTitle.replace(/_{2,}/g, "_").toLowerCase()}.json`;

        // Save the book data as a JSON file
        fs.writeFileSync(`${dir}/${filename}`, JSON.stringify(bookData, null, 2));
    });
}

// Execute the function and handle any errors
getGoodreadsBooks().catch(console.error);
