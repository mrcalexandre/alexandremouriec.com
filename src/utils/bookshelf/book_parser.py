from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from storygraph_utils import parse_date_read

def extract_text(tag: Optional[BeautifulSoup], selector: str = "a") -> str:
    """Extract text from a BeautifulSoup tag with optional selector."""
    if not tag:
        return ""
    element = tag.find(selector)
    return element.get_text(strip=True) if element else ""

def extract_attribute(tag: Optional[BeautifulSoup], attr: str, default: str = "") -> str:
    """Extract attribute from a BeautifulSoup tag."""
    if not tag or not tag.has_attr(attr):
        return default
    return tag[attr]

def extract_date_read(book_div: BeautifulSoup) -> str:
    """Extract reading date from book div."""
    action_menu = book_div.find("div", class_=lambda c: c and c.startswith("action-menu"))
    if not action_menu:
        return ""
        
    date_link = action_menu.find("a", href=lambda x: x and "edit-read-instance-from-book" in x)
    if not date_link:
        return ""
        
    date_p = date_link.find("p")
    if not date_p:
        return ""
        
    return parse_date_read(date_p.get_text(strip=True))

def extract_book_data(book_div: BeautifulSoup, extract_date: bool = False) -> Optional[Dict[str, Any]]:
    """Extract book data from a book div."""
    title_tag = book_div.find("h3", class_="text-xl")
    author_tag = book_div.find("p", class_="font-body")
    img_tag = book_div.find("img", class_="dark:shadow-darkerGrey/40")
    
    title = extract_text(title_tag)
    if not title:
        return None
        
    return {
        "author": extract_text(author_tag),
        "cover_image": {
            "cover_image_alt": extract_attribute(img_tag, "alt"),
            "cover_image_url": extract_attribute(img_tag, "src")
        },
        "date_read": extract_date_read(book_div) if extract_date else "",
        "title": title
    }

def parse_books(html: str, extract_date: bool = False) -> List[Dict[str, Any]]:
    """Parse books from HTML."""
    soup = BeautifulSoup(html, "html.parser")
    books = []
    
    for book_div in soup.find_all("div", class_="book-pane"):
        book_data = extract_book_data(book_div, extract_date)
        if book_data:
            books.append(book_data)
    
    return books 