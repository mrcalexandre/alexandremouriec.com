import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from storygraph_utils import get_driver, wait_for_page_load, save_book, BOOKS_DIR
from book_parser import parse_books

# Constants
USERNAME = "mrcalexandre"
URL = f"https://app.thestorygraph.com/books-read/{USERNAME}"

def main() -> None:
    """Main function to fetch and save read books."""
    load_dotenv()
    cookie = os.getenv('STORYGRAPH_COOKIE')
    if not cookie:
        print("Error: STORYGRAPH_COOKIE environment variable not set")
        return
        
    os.makedirs(BOOKS_DIR, exist_ok=True)
    
    driver = get_driver(cookie)
    try:
        driver.get(URL)
        if not wait_for_page_load(driver):
            print("Failed to load page")
            return
            
        books = parse_books(driver.page_source, extract_date=True)
        for book in books:
            save_book(book, BOOKS_DIR)
        print(f"{len(books)} books saved to {BOOKS_DIR}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main() 