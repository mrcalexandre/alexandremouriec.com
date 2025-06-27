import os
import json
import time
import unicodedata
import re
from datetime import datetime
from typing import Optional, Dict, Any
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

# Constants
BOOKS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "content", "books")
CHROME_OPTIONS = [
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
]
DEFAULT_TIMEOUT = 10

def normalize_string(s: str) -> str:
    """Normalize a string to create a valid filename."""
    if not s:
        return ""
    s = s.replace(':', '').replace('!', '')
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '_', s)
    return re.sub(r'_{2,}', '_', s).strip('_')

def create_filename(title: str) -> str:
    """Create a filename from a book title."""
    return f"{normalize_string(title)}.json"

def get_driver(cookie: Optional[str] = None) -> webdriver.Chrome:
    """Configure and return a Chrome WebDriver instance."""
    chrome_options = Options()
    for option in CHROME_OPTIONS:
        chrome_options.add_argument(option)
    
    driver = webdriver.Chrome(options=chrome_options)
    
    if cookie:
        driver.get("https://app.thestorygraph.com")
        driver.add_cookie({
            'name': 'remember_user_token',
            'value': cookie,
            'domain': '.thestorygraph.com'
        })
    return driver

def wait_for_page_load(driver: webdriver.Chrome, timeout: int = DEFAULT_TIMEOUT) -> bool:
    """Wait for the page to be fully loaded."""
    try:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CLASS_NAME, "book-pane"))
        )
        return True
    except TimeoutException:
        print("Timeout waiting for page to load")
        return False

def save_book(book: Dict[str, Any], directory: str, currently_reading: bool = False) -> None:
    """Save book information to a JSON file."""
    if not book or not book.get("title"):
        return

    book_data = {
        'title': str(book['title']),
        'author': str(book.get('author', '')),
        'cover_image': {
            'cover_image_url': str(book.get('cover_image', {}).get('cover_image_url', '')),
            'cover_image_alt': str(book.get('cover_image', {}).get('cover_image_alt', ''))
        },
        'date_read': str(book.get('date_read', '')),
        'currently_reading': currently_reading
    }

    filename = create_filename(book['title'])
    filepath = os.path.join(directory, filename)
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(book_data, f, indent=2, ensure_ascii=False)
        print(f"Saved: {filepath}")
    except IOError as e:
        print(f"Error saving book {book['title']}: {e}")

def parse_date_read(date_text: str) -> str:
    """Parse the reading date from text."""
    if not date_text:
        return ""
    
    if isinstance(date_text, str) and date_text.startswith('Finished '):
        date_text = date_text.replace('Finished ', '').replace('Click to edit read date', '')
        try:
            date_obj = datetime.strptime(date_text, '%b %d, %Y')
            return date_obj.strftime('%Y-%m-%d')
        except ValueError:
            return ""
    return str(date_text) 