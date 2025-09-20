from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from app.models.seo import SeoMeta

class SeoService:
    """
    Service for handling SEO metadata.
    """
    
    def get_seo_meta(self, db: Session, entity_type: str, entity_id: int) -> Optional[SeoMeta]:
        """
        Get SEO metadata for an entity.
        
        Args:
            db: Database session
            entity_type: Type of entity (e.g., "region", "country", "package")
            entity_id: ID of the entity
            
        Returns:
            SeoMeta object or None if not found
        """
        return db.query(SeoMeta).filter(
            SeoMeta.entity_type == entity_type,
            SeoMeta.entity_id == entity_id
        ).first()
    
    def create_seo_meta(self, db: Session, entity_type: str, entity_id: int, 
                       title: str, description: str, keywords: Optional[str] = None,
                       canonical_url: Optional[str] = None, og_title: Optional[str] = None,
                       og_description: Optional[str] = None, og_image_url: Optional[str] = None,
                       twitter_card: Optional[str] = None, twitter_title: Optional[str] = None,
                       twitter_description: Optional[str] = None, twitter_image_url: Optional[str] = None,
                       structured_data: Optional[Dict[str, Any]] = None) -> SeoMeta:
        """
        Create SEO metadata for an entity.
        
        Args:
            db: Database session
            entity_type: Type of entity (e.g., "region", "country", "package")
            entity_id: ID of the entity
            title: SEO title
            description: SEO description
            keywords: SEO keywords
            canonical_url: Canonical URL
            og_title: Open Graph title
            og_description: Open Graph description
            og_image_url: Open Graph image URL
            twitter_card: Twitter card type
            twitter_title: Twitter title
            twitter_description: Twitter description
            twitter_image_url: Twitter image URL
            structured_data: JSON-LD structured data
            
        Returns:
            Created SeoMeta object
        """
        # Check if SEO metadata already exists for this entity
        existing_seo = self.get_seo_meta(db, entity_type, entity_id)
        if existing_seo:
            # Update existing SEO metadata
            return self.update_seo_meta(
                db, existing_seo.id, title, description, keywords, canonical_url,
                og_title, og_description, og_image_url, twitter_card, twitter_title,
                twitter_description, twitter_image_url, structured_data
            )
        
        # Create new SEO metadata
        db_seo = SeoMeta(
            entity_type=entity_type,
            entity_id=entity_id,
            title=title,
            description=description,
            keywords=keywords,
            canonical_url=canonical_url,
            og_title=og_title or title,
            og_description=og_description or description,
            og_image_url=og_image_url,
            twitter_card=twitter_card or "summary_large_image",
            twitter_title=twitter_title or og_title or title,
            twitter_description=twitter_description or og_description or description,
            twitter_image_url=twitter_image_url or og_image_url,
            structured_data=structured_data
        )
        db.add(db_seo)
        db.commit()
        db.refresh(db_seo)
        return db_seo
    
    def update_seo_meta(self, db: Session, seo_id: int, title: Optional[str] = None,
                       description: Optional[str] = None, keywords: Optional[str] = None,
                       canonical_url: Optional[str] = None, og_title: Optional[str] = None,
                       og_description: Optional[str] = None, og_image_url: Optional[str] = None,
                       twitter_card: Optional[str] = None, twitter_title: Optional[str] = None,
                       twitter_description: Optional[str] = None, twitter_image_url: Optional[str] = None,
                       structured_data: Optional[Dict[str, Any]] = None) -> Optional[SeoMeta]:
        """
        Update SEO metadata.
        
        Args:
            db: Database session
            seo_id: ID of the SEO metadata to update
            title: SEO title
            description: SEO description
            keywords: SEO keywords
            canonical_url: Canonical URL
            og_title: Open Graph title
            og_description: Open Graph description
            og_image_url: Open Graph image URL
            twitter_card: Twitter card type
            twitter_title: Twitter title
            twitter_description: Twitter description
            twitter_image_url: Twitter image URL
            structured_data: JSON-LD structured data
            
        Returns:
            Updated SeoMeta object or None if not found
        """
        db_seo = db.query(SeoMeta).filter(SeoMeta.id == seo_id).first()
        if not db_seo:
            return None
        
        if title is not None:
            db_seo.title = title
        
        if description is not None:
            db_seo.description = description
        
        if keywords is not None:
            db_seo.keywords = keywords
        
        if canonical_url is not None:
            db_seo.canonical_url = canonical_url
        
        if og_title is not None:
            db_seo.og_title = og_title
        
        if og_description is not None:
            db_seo.og_description = og_description
        
        if og_image_url is not None:
            db_seo.og_image_url = og_image_url
        
        if twitter_card is not None:
            db_seo.twitter_card = twitter_card
        
        if twitter_title is not None:
            db_seo.twitter_title = twitter_title
        
        if twitter_description is not None:
            db_seo.twitter_description = twitter_description
        
        if twitter_image_url is not None:
            db_seo.twitter_image_url = twitter_image_url
        
        if structured_data is not None:
            db_seo.structured_data = structured_data
        
        db.commit()
        db.refresh(db_seo)
        return db_seo
    
    def delete_seo_meta(self, db: Session, seo_id: int) -> bool:
        """
        Delete SEO metadata.
        
        Args:
            db: Database session
            seo_id: ID of the SEO metadata to delete
            
        Returns:
            True if deleted successfully, False otherwise
        """
        db_seo = db.query(SeoMeta).filter(SeoMeta.id == seo_id).first()
        if not db_seo:
            return False
        
        db.delete(db_seo)
        db.commit()
        return True
    
    def generate_structured_data(self, entity_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for an entity.
        
        Args:
            entity_type: Type of entity (e.g., "region", "country", "package")
            data: Entity data
            
        Returns:
            JSON-LD structured data
        """
        if entity_type == "region":
            return self._generate_region_structured_data(data)
        elif entity_type == "country":
            return self._generate_country_structured_data(data)
        elif entity_type == "attraction":
            return self._generate_attraction_structured_data(data)
        elif entity_type == "accommodation":
            return self._generate_accommodation_structured_data(data)
        elif entity_type == "package":
            return self._generate_package_structured_data(data)
        elif entity_type == "group_trip":
            return self._generate_group_trip_structured_data(data)
        elif entity_type == "blog_post":
            return self._generate_blog_post_structured_data(data)
        else:
            return {}
    
    def _generate_region_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for a region.
        
        Args:
            data: Region data
            
        Returns:
            JSON-LD structured data
        """
        return {
            "@context": "https://schema.org",
            "@type": "Place",
            "name": data.get("name"),
            "description": data.get("description"),
            "url": data.get("url")
        }
    
    def _generate_country_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for a country.
        
        Args:
            data: Country data
            
        Returns:
            JSON-LD structured data
        """
        return {
            "@context": "https://schema.org",
            "@type": "Country",
            "name": data.get("name"),
            "description": data.get("description"),
            "url": data.get("url")
        }
    
    def _generate_attraction_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for an attraction.
        
        Args:
            data: Attraction data
            
        Returns:
            JSON-LD structured data
        """
        return {
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            "name": data.get("name"),
            "description": data.get("description"),
            "url": data.get("url"),
            "image": data.get("image_url")
        }
    
    def _generate_accommodation_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for an accommodation.
        
        Args:
            data: Accommodation data
            
        Returns:
            JSON-LD structured data
        """
        structured_data = {
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            "name": data.get("name"),
            "description": data.get("description"),
            "url": data.get("url"),
            "image": data.get("image_url"),
            "address": {
                "@type": "PostalAddress",
                "streetAddress": data.get("address")
            }
        }
        
        # Add star rating if available
        if data.get("stars"):
            structured_data["starRating"] = {
                "@type": "Rating",
                "ratingValue": data.get("stars")
            }
        
        return structured_data
    
    def _generate_package_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for a package.
        
        Args:
            data: Package data
            
        Returns:
            JSON-LD structured data
        """
        return {
            "@context": "https://schema.org",
            "@type": "TravelService",
            "name": data.get("name"),
            "description": data.get("description"),
            "url": data.get("url"),
            "image": data.get("image_url"),
            "provider": {
                "@type": "Organization",
                "name": "Allbounds"
            },
            "offers": {
                "@type": "Offer",
                "price": data.get("price"),
                "priceCurrency": "USD"
            }
        }
    
    def _generate_group_trip_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for a group trip.
        
        Args:
            data: Group trip data
            
        Returns:
            JSON-LD structured data
        """
        return {
            "@context": "https://schema.org",
            "@type": "TravelService",
            "name": data.get("name"),
            "description": data.get("description"),
            "url": data.get("url"),
            "image": data.get("image_url"),
            "provider": {
                "@type": "Organization",
                "name": "Allbounds"
            },
            "offers": {
                "@type": "Offer",
                "price": data.get("price"),
                "priceCurrency": "USD"
            }
        }
    
    def _generate_blog_post_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for a blog post.
        
        Args:
            data: Blog post data
            
        Returns:
            JSON-LD structured data
        """
        return {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": data.get("title"),
            "description": data.get("summary"),
            "image": data.get("image_url"),
            "datePublished": data.get("published_at"),
            "dateModified": data.get("updated_at"),
            "author": {
                "@type": "Person",
                "name": data.get("author")
            },
            "publisher": {
                "@type": "Organization",
                "name": "Allbounds",
                "logo": {
                    "@type": "ImageObject",
                    "url": data.get("publisher_logo_url")
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": data.get("url")
            }
        }

seo_service = SeoService()
