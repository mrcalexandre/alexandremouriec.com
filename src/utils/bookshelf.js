import fs from "fs";
import https from "https";
import { DOMParser } from 'xmldom';

// Function to fetch data from a URL
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
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

async function getGoodreadsBooks() {
    try {
        // Goodreads RSS feed URL with your user ID and API key
        const url = "https://www.goodreads.com/review/list_rss/51626532?key=DLQz_TdaH9a8JYqPbY9AV6UU-LPMXRtUBIxM2g9gXiNnLGSR&shelf=read";

        // Fetch the RSS feed data
        const xml = await fetchData(url);
        const doc = new DOMParser().parseFromString(xml, 'text/xml');
        const items = doc.getElementsByTagName('item');

        // Ensure the directory exists
        const dir = "./src/content/books/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Process each book item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const description = item.getElementsByTagName('description')[0].textContent;
            const urlMatch = description.match(/<a href="(https:\/\/www\.goodreads\.com\/book\/show\/\d+\.([^"]+))"/);
            const bookUrl = urlMatch ? urlMatch[1] : item.getElementsByTagName('link')[0].textContent;

            const bookData = {
                author: item.getElementsByTagName('author_name')[0].textContent,
                cover_image: {
                    cover_image_alt: item.getElementsByTagName('book_large_image_alt')[0]?.textContent || "",
                    cover_image_url: item.getElementsByTagName('book_large_image_url')[0].textContent,
                },
                date_read: item.getElementsByTagName('user_read_at')[0].textContent,
                link: bookUrl,
                title: item.getElementsByTagName('title')[0].textContent
            };

            // Normalize and sanitize the book title for filename
            let normalizedTitle = normalizeString(bookData.title);
            normalizedTitle = normalizedTitle
                .replace(/[^a-z0-9]+/gi, "_") // Replace non-alphanumeric characters with a single underscore
                .replace(/_{2,}/g, "_"); // Remove duplicate underscores
            const filename = `${normalizedTitle.toLowerCase()}.json`;

            // Save the book data as a JSON file
            fs.writeFileSync(`${dir}/${filename}`, JSON.stringify(bookData, null, 2));
        }
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

// Execute the function and handle any errors
getGoodreadsBooks().catch(console.error);
