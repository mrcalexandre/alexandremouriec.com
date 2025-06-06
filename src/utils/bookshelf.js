import fs from 'fs/promises';
import { DOMParser } from 'xmldom';
import https from 'https';

// Utility function to fetch data from a URL with retry and timeout
async function fetchData(url) {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000 // 10 seconds timeout
    };

    return new Promise((resolve, reject) => {
        const req = https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP error! status: ${res.statusCode}`));
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Utility function to parse XML and extract items with better error handling
function parseXmlItems(xml, tagName, itemProcessor) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        
        const parserError = doc.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
            throw new Error('XML parsing error: ' + parserError[0].textContent);
        }
        
        return Array.from(doc.getElementsByTagName(tagName))
            .map(itemProcessor)
            .filter(item => item !== null);
    } catch (error) {
        console.error(`Error parsing XML for ${tagName}:`, error);
        return [];
    }
}

// Function to normalize book titles for consistent formatting
function normalizeString(str) {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

// Function to create a filename from a book title
function createFilename(title) {
    return normalizeString(title)
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '') + '.json';
}

// Function to process a book item and extract its data
function processBookItem(item) {
    try {
        const description = item.getElementsByTagName('description')[0]?.textContent || '';
        const urlMatch = description.match(/<a href="(https:\/\/www\.goodreads\.com\/book\/show\/\d+\.([^"]+))"/);
        const bookUrl = urlMatch?.[1] || item.getElementsByTagName('link')[0]?.textContent || '';

        const author = item.getElementsByTagName('author_name')[0]?.textContent;
        const title = item.getElementsByTagName('title')[0]?.textContent;

        if (!author || !title) return null;

        // Format date as YYYY-MM-DD or empty string if no date
        const rawDate = item.getElementsByTagName('user_read_at')[0]?.textContent;
        const formattedDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';

        return {
            author,
            cover_image: {
                cover_image_alt: item.getElementsByTagName('book_large_image_alt')[0]?.textContent || '',
                cover_image_url: item.getElementsByTagName('book_large_image_url')[0]?.textContent || '',
            },
            date_read: formattedDate,
            link: bookUrl,
            title
        };
    } catch (error) {
        console.error('Error processing book item:', error);
        return null;
    }
}

// Function to save a book to a JSON file
async function saveBook(book, directory) {
    const filename = createFilename(book.title);
    const filepath = `${directory}/${filename}`;
    await fs.writeFile(filepath, JSON.stringify(book, null, 2));
    console.log(`Saved book: ${book.title}`);
}

// Main function to fetch and save books with improved error handling and retries
async function getGoodreadsBooks() {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    const url = "https://www.goodreads.com/review/list_rss/51626532?key=DLQz_TdaH9a8JYqPbY9AV6UU-LPMXRtUBIxM2g9gXiNnLGSR&shelf=read";
    const directory = "./src/content/books/";

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Attempt ${attempt} to fetch Goodreads RSS feed...`);
            await fs.mkdir(directory, { recursive: true });
            const xml = await fetchData(url);
            const books = parseXmlItems(xml, 'item', processBookItem);

            if (books.length === 0) {
                throw new Error('No books found in the RSS feed');
            }

            await Promise.all(books.map(book => saveBook(book, directory)));
            console.log(`Successfully processed ${books.length} books`);
            return;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            if (attempt === MAX_RETRIES) {
                throw error;
            }
            console.log(`Retrying in ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}

// Execute the function and handle any errors
getGoodreadsBooks().catch(error => {
    console.error('Failed to update bookshelf:', error);
    process.exit(1);
});
