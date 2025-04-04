import fs from "fs";
import https from "https";
import { DOMParser } from 'xmldom';

// Utility function to fetch data from a URL
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// Utility function to parse XML and extract items with better error handling
function parseXmlItems(xml, tagName, itemProcessor) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        
        // Check for parsing errors using xmldom's native methods
        const parserError = doc.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
            throw new Error('XML parsing error: ' + parserError[0].textContent);
        }
        
        const items = doc.getElementsByTagName(tagName);
        return Array.from(items).map(itemProcessor);
    } catch (error) {
        console.error(`Error parsing XML for ${tagName}:`, error);
        return [];
    }
}

// Function to normalize book titles for consistent formatting
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

// Function to create a filename from a book title
function createFilename(title) {
    return normalizeString(title)
        .replace(/[^a-z0-9]+/gi, "_") // Replace non-alphanumeric characters with a single underscore
        .replace(/_{2,}/g, "_") // Remove duplicate underscores
        .toLowerCase() + ".json";
}

// Function to process a book item and extract its data
function processBookItem(item) {
    const description = item.getElementsByTagName('description')[0].textContent;
    const urlMatch = description.match(/<a href="(https:\/\/www\.goodreads\.com\/book\/show\/\d+\.([^"]+))"/);
    const bookUrl = urlMatch ? urlMatch[1] : item.getElementsByTagName('link')[0].textContent;

    return {
        author: item.getElementsByTagName('author_name')[0].textContent,
        cover_image: {
            cover_image_alt: item.getElementsByTagName('book_large_image_alt')[0]?.textContent || "",
            cover_image_url: item.getElementsByTagName('book_large_image_url')[0].textContent,
        },
        date_read: item.getElementsByTagName('user_read_at')[0].textContent,
        link: bookUrl,
        title: item.getElementsByTagName('title')[0].textContent
    };
}

// Function to save a book to a JSON file
async function saveBook(book, directory) {
    const filename = createFilename(book.title);
    await fs.promises.writeFile(
        `${directory}/${filename}`,
        JSON.stringify(book, null, 2)
    );
    console.log(`Saved book: ${book.title}`);
}

// Main function to fetch and save books with improved error handling and retries
async function getGoodreadsBooks() {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const url = "https://www.goodreads.com/review/list_rss/51626532?key=DLQz_TdaH9a8JYqPbY9AV6UU-LPMXRtUBIxM2g9gXiNnLGSR&shelf=read";
            const directory = "./src/content/books/";

            // Ensure the directory exists
            await fs.promises.mkdir(directory, { recursive: true });

            // Fetch and parse the RSS feed
            const xml = await fetchData(url);
            const books = parseXmlItems(xml, 'item', processBookItem);

            // Save all books concurrently with progress tracking
            const totalBooks = books.length;
            let processedBooks = 0;
            
            await Promise.all(books.map(async (book) => {
                await saveBook(book, directory);
                processedBooks++;
            }));

            console.log(`Successfully processed ${books.length} books`);
            return;
        } catch (error) {
            if (attempt === MAX_RETRIES) {
                throw error;
            }
            console.log(`Attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}

// Execute the function and handle any errors
getGoodreadsBooks().catch(error => {
    console.error('Failed to update bookshelf:', error);
    process.exit(1);
});
