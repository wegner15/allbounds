import re
from unidecode import unidecode
from sqlalchemy.orm import Session

def create_slug(text: str) -> str:
    """
    Create a URL-friendly slug from a string.
    
    Args:
        text: The string to convert to a slug
        
    Returns:
        A URL-friendly slug
    """
    # Convert to ASCII
    text = unidecode(text)
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text)
    
    # Remove all non-word characters (except hyphens)
    text = re.sub(r'[^\w\-]', '', text)
    
    # Replace multiple hyphens with a single hyphen
    text = re.sub(r'-+', '-', text)
    
    # Remove leading/trailing hyphens
    text = text.strip('-')
    
    return text

def ensure_unique_slug(db: Session, model, slug: str, exclude_id: int = None) -> str:
    """
    Ensure a slug is unique by appending a number if necessary.
    
    Args:
        db: Database session
        model: SQLAlchemy model class
        slug: The slug to check
        exclude_id: Optional ID to exclude from the check (for updates)
        
    Returns:
        A unique slug
    """
    original_slug = slug
    counter = 1
    
    while True:
        # Check if slug exists
        query = db.query(model).filter(model.slug == slug)
        
        # Exclude the current item if updating
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
            
        exists = db.query(query.exists()).scalar()
        
        if not exists:
            return slug
            
        # If slug exists, append a number and try again
        slug = f"{original_slug}-{counter}"
        counter += 1
