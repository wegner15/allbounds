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

def update_slug_if_name_changed(update_data: dict, db: Session, model, current_slug: str, item_id: int = None) -> dict:
    """
    Helper function to safely update slug when name changes.
    Prevents duplicate slug errors by checking if the new slug is different
    and ensuring uniqueness.
    
    Args:
        update_data: Dictionary of fields to update
        db: Database session
        model: SQLAlchemy model class
        current_slug: Current slug of the item
        item_id: ID of the item being updated (for uniqueness check)
        
    Returns:
        Updated update_data dictionary with slug if needed
    """
    if "name" in update_data:
        new_slug = create_slug(update_data["name"])
        # Only update slug if it's different from the current one
        if new_slug != current_slug:
            # Ensure the new slug is unique
            update_data["slug"] = ensure_unique_slug(db, model, new_slug, exclude_id=item_id)
        # If slug is the same, don't include it in update_data to avoid constraint violation
    
    return update_data
