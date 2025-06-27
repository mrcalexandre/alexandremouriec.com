import fs from "fs";
import https from "https";
import path from 'path';

// Utility functions
const fetchData = (url) => new Promise((resolve, reject) => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
    }).on('error', reject);
});

const parseDate = (dateStr) => dateStr ? new Date(dateStr) : null;
const isInMonth = (date, month, year) => date && date.getMonth() === month - 1 && date.getFullYear() === year;

// Simple XML parser for RSS feed
const parseRssXml = (xml) => {
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    while ((match = entryRegex.exec(xml)) !== null) {
        const entry = match[1];
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1];
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1];
        const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*>/)?.[1];
        const content = entry.match(/<content[^>]*>(.*?)<\/content>/)?.[1] || '';
        const description = content.match(/class="markdown">(.*?)<\/div>/s)?.[1]?.trim() || '';
        
        if (published && title && link) {
            entries.push({ published, title, link, description });
        }
    }
    
    return entries;
};

// Fetch RSS feed entries for a specific month
const fetchRssFeed = async (url, month, year) => {
    try {
        const xml = await fetchData(url);
        const entries = parseRssXml(xml);
        
        return entries
            .map(entry => {
                const publishedDate = parseDate(entry.published);
                if (!isInMonth(publishedDate, month, year)) return null;
                
                return {
                    title: entry.title,
                    link: entry.link,
                    description: entry.description
                };
            })
            .filter(Boolean);
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        return [];
    }
};

// Get books read in a specific month
const getBooks = (month, year) => {
    try {
        const booksDir = './src/content/books/';
        const bookFiles = fs.readdirSync(booksDir).filter(file => file.endsWith('.json'));
        
        return bookFiles
            .map(file => {
                const bookData = JSON.parse(fs.readFileSync(path.join(booksDir, file), 'utf8'));
                const readDate = parseDate(bookData.date_read);
                
                if (!readDate || bookData.currently_reading || !isInMonth(readDate, month, year)) {
                    return null;
                }
                
                return {
                    title: bookData.title,
                    author: bookData.author,
                    date_read: readDate,
                    cover_image: bookData.cover_image || {}
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.date_read - a.date_read);
    } catch (error) {
        console.error('Error reading books:', error);
        return [];
    }
};

// Get articles published in a specific month
const getArticles = (month, year) => {
    try {
        const postsDir = './src/content/posts/';
        const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
        
        return postFiles
            .map(file => {
                const postContent = fs.readFileSync(path.join(postsDir, file), 'utf8');
                const frontmatter = postContent.match(/^---\n([\s\S]*?)\n---/)?.[1];
                
                if (!frontmatter) return null;
                
                const pubDate = parseDate(frontmatter.match(/pubDate:\s*(.+)/)?.[1]?.trim());
                if (!isInMonth(pubDate, month, year)) return null;
                
                return {
                    title: frontmatter.match(/title:\s*(.+)/)?.[1]?.trim() || file.replace('.md', ''),
                    description: frontmatter.match(/description:\s*(.+)/)?.[1]?.trim() || '',
                    pubDate,
                    slug: file.replace('.md', '')
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.pubDate - a.pubDate);
    } catch (error) {
        console.error('Error reading articles:', error);
        return [];
    }
};

// Generate markdown content
const generateMarkdown = (month, year, links, books, articles) => {
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    const pubDate = new Date(year, month - 1, 1).toISOString();
    const formatDate = (date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const sections = [
        `---
title: Full-Time Curious - ${monthName}
author: Alexandre Mouriec
pubDate: ${pubDate}
description: A monthly recap of what I've been reading, watching, and thinking about.
tags: ["newsletter", "monthly"]
---

## ✨ Highlights of the last month\n\n

---`,
        
        articles.length > 0 ? 
            `## ✍️ Articles I wrote this month\n\n${articles.map(article => 
                `#### [${article.title}](/blog/${article.slug})\n\n${article.description ? `> ${article.description}\n\n` : ''}**Published:** ${formatDate(article.pubDate)}\n\n---\n`
            ).join('')}\n` : '',
        
        `## 📚 What I liked consuming the last month\n\n_Let's dive now into what I consumed the last month and especially liked_\n\n### Links\n\n${links.map(link => 
            `#### ${link.title}\n<small><u>link:</u> ${link.link}</small>\n\n${link.description ? `> ${link.description.trim().replace(/<[^>]*>?/gm, '').replace(/\n/g, '\n> ')}\n\n---\n` : '---\n'}`
        ).join('')}`,
        
        `### Books\n\n${books.map(book => 
            `#### ${book.title}\n\n<div style="display: flex; gap: 20px; margin-bottom: 20px;">\n${book.cover_image.cover_image_url ? `  <img src="${book.cover_image.cover_image_url}" alt="${book.cover_image.cover_image_alt || book.title}" width="150" style="border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />\n` : ''}  <div>\n    <p style="margin-top: 25px;"><strong>Author:</strong> ${book.author}</p>\n    <p style="margin: 0;"><strong>Read:</strong> ${formatDate(book.date_read)}</p>\n  </div>\n</div>\n\n---\n`
        ).join('')}`,
        
        `## 👀 What I'm up to the next month\n\n<!-- Add your future plans here -->\n\n---

> And that's it for this month's issue of Full-Time Curious 😁 If you enjoyed reading this issue, you can like this newsletter by clicking the ❤️ below, subscribe or respond to this email so we can chat.\n\n> Thanks for reading and see you next month!\n\n> **Alexandre**\n`
    ];
    
    return sections.filter(Boolean).join('\n');
};

// Main function
const generateRecap = async (month) => {
    if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
    }
    
    const year = new Date().getFullYear();
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' }).toLowerCase();
    const outputFile = `./src/content/newsletters/${year}-${monthName}.md`;
    const rssUrl = 'https://links.alexandremouriec.com/feed/atom';
    
    try {
        const [links, books, articles] = await Promise.all([
            fetchRssFeed(rssUrl, month, year),
            Promise.resolve(getBooks(month, year)),
            Promise.resolve(getArticles(month, year))
        ]);
        
        const markdownContent = generateMarkdown(month, year, links, books, articles);
        fs.writeFileSync(outputFile, markdownContent);
        console.log(`File ${outputFile} created successfully!`);
    } catch (error) {
        console.error('Error generating recap:', error);
        process.exit(1);
    }
};

// CLI
const month = parseInt(process.argv.find(arg => arg.startsWith('-m'))?.split('=')[1]);

if (isNaN(month)) {
    console.error('Please specify a valid month with -m. Example: -m=3 for March.');
    process.exit(1);
}

generateRecap(month);
