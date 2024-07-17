// Ensure to load the .env variables
import fs from 'fs';
import https from 'https';

const DOMAIN = 'alexandremouriec.com';
const WEBMENTION_API_KEY = process.env.WEBMENTION_API_KEY;

if (!WEBMENTION_API_KEY) {
  console.error('Error: WEBMENTION_API_KEY environment variable is not set.');
  process.exit(1);
}

(async () => {
  try {
    const webmentions = await fetchWebmentions();
    if (webmentions.length === 1) {
      console.log(`One webmention has been added.`);
      webmentions.forEach(writeWebMention);
    }
    else if (webmentions.length > 1) {
      console.log(`${webmentions.length} webmentions have been added.`);
      webmentions.forEach(writeWebMention);
    } else {
      console.log('There are no new webmentions available.');
    }
  } catch (error) {
    console.error('Error fetching webmentions:', error);
  }
})();

function fetchWebmentions() {
  const url = `https://webmention.io/api/mentions.jf2?domain=${DOMAIN}&token=${WEBMENTION_API_KEY}&per-page=999`;

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let body = '';

      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            const errorResponse = JSON.parse(body);
            reject(new Error(`API request failed with status ${res.statusCode}: ${errorResponse.error_description}`));
            return;
          }
          const response = JSON.parse(body);
          resolve(response.children);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => reject(error));
  });
}

function writeWebMention(webmention) {
  const slug = webmention['wm-target']
    .replace(`https://${DOMAIN}/`, '')
    .replace(/\/$/, '')
    .replace('/', '--');
  const filename = `./src/content/webmentions/${slug || 'home'}.json`;

  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, JSON.stringify([webmention], null, 2));
    return;
  }

  const entries = JSON.parse(fs.readFileSync(filename))
    .filter((wm) => wm['wm-id'] !== webmention['wm-id'])
    .concat([webmention]);
  entries.sort((a, b) => a['wm-id'] - b['wm-id']);
  fs.writeFileSync(filename, JSON.stringify(entries, null, 2));
}
