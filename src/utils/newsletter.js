import fs from "fs";
import fetch from "node-fetch";
import xml2js from "xml2js";

// Fetch the RSS feed and parse it into JSON
async function fetchAndParseRSSFeed() {
  // URL of the Substack RSS feed
  const url = "https://fulltimecurious.substack.com/feed";

  // Fetch the RSS feed data
  const response = await fetch(url);
  const xml = await response.text(); // Convert the response to text (XML format)

  // Parse the XML into a JavaScript object
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);

  // Ensure the directory exists
  const dir = "./src/content/newsletters/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Get all newsletters and reverse the array so oldest comes first
  const newsletters = result.rss.channel[0].item;

  // Map through each newsletter issue and save each as a separate JSON file
  newsletters.forEach((newsletter, index) => {
    // Calculate the ID (total number of newsletters - current index)
    // This ensures the newest newsletter gets the highest ID
    const id = newsletters.length - index;

    // Extract the data for each newsletter
    const sanitizedTitle = newsletter.title[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, "_"); // Clean title for file name

    const newsletterData = {
      description: newsletter.description[0],
      link: newsletter.link[0],
      pubDate: newsletter.pubDate[0],
      title: newsletter.title[0],
    };

    // Save the newsletter data as a JSON file
    fs.writeFileSync(
      `${dir}/${id}_${sanitizedTitle}.json`,
      JSON.stringify(newsletterData, null, 2)
    );
  });
}

// Execute the function and handle any errors
fetchAndParseRSSFeed().catch(console.error);
