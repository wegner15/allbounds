from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.blog import BlogPost, Tag
from app.utils.slug import create_slug

class BlogService:
    def get_blog_posts(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        active_only: bool = True,
        published_only: bool = True
    ) -> List[BlogPost]:
        """
        Get all blog posts.
        """
        query = db.query(BlogPost)
        if active_only:
            query = query.filter(BlogPost.is_active == True)
        if published_only:
            query = query.filter(BlogPost.is_published == True)
        return query.order_by(BlogPost.created_at.desc()).offset(skip).limit(limit).all()

    def get_blog_post(
        self, 
        db: Session, 
        post_id: int
    ) -> Optional[BlogPost]:
        """
        Get a blog post by ID.
        """
        return db.query(BlogPost).filter(BlogPost.id == post_id).first()

    def get_blog_post_by_slug(
        self, 
        db: Session, 
        slug: str
    ) -> Optional[BlogPost]:
        """
        Get a blog post by slug.
        """
        return db.query(BlogPost).filter(BlogPost.slug == slug).first()

    def create_blog_post(
        self, 
        db: Session, 
        title: str,
        content: str,
        author_id: int,
        summary: Optional[str] = None,
        featured_image: Optional[str] = None,
        tags: Optional[List[str]] = None,
        slug: Optional[str] = None,
        is_published: bool = False
    ) -> BlogPost:
        """
        Create a new blog post.
        """
        if not slug:
            slug = create_slug(title)
            
        db_blog_post = BlogPost(
            title=title,
            content=content,
            summary=summary,
            slug=slug,
            author_id=author_id,
            is_published=is_published
        )
        
        # Handle tags
        if tags:
            for tag_name in tags:
                # Check if tag exists
                tag_slug = create_slug(tag_name)
                tag = db.query(Tag).filter(Tag.slug == tag_slug).first()
                if not tag:
                    # Create new tag
                    tag = Tag(name=tag_name, slug=tag_slug)
                    db.add(tag)
                # Add tag to blog post
                db_blog_post.tags.append(tag)
        
        # Set published_at if post is published
        if is_published:
            db_blog_post.published_at = datetime.utcnow()
            
        db.add(db_blog_post)
        db.commit()
        db.refresh(db_blog_post)
        return db_blog_post

    def update_blog_post(
        self, 
        db: Session, 
        post_id: int,
        title: Optional[str] = None,
        content: Optional[str] = None,
        summary: Optional[str] = None,
        featured_image: Optional[str] = None,
        tags: Optional[List[str]] = None,
        is_published: Optional[bool] = None,
        is_active: Optional[bool] = None
    ) -> Optional[BlogPost]:
        """
        Update a blog post.
        """
        db_blog_post = self.get_blog_post(db, post_id)
        if db_blog_post is None:
            return None
            
        if title is not None:
            db_blog_post.title = title
        if content is not None:
            db_blog_post.content = content
        if summary is not None:
            db_blog_post.summary = summary
        if featured_image is not None:
            db_blog_post.featured_image = featured_image
        if tags is not None:
            # Clear existing tags
            db_blog_post.tags = []
            
            # Add new tags
            for tag_name in tags:
                # Check if tag exists
                tag_slug = create_slug(tag_name)
                tag = db.query(Tag).filter(Tag.slug == tag_slug).first()
                if not tag:
                    # Create new tag
                    tag = Tag(name=tag_name, slug=tag_slug)
                    db.add(tag)
                # Add tag to blog post
                db_blog_post.tags.append(tag)
                
        if is_published is not None:
            db_blog_post.is_published = is_published
            if is_published and not db_blog_post.published_at:
                db_blog_post.published_at = datetime.utcnow()
        if is_active is not None:
            db_blog_post.is_active = is_active
            
        db.commit()
        db.refresh(db_blog_post)
        return db_blog_post

    def delete_blog_post(
        self, 
        db: Session, 
        post_id: int
    ) -> Optional[BlogPost]:
        """
        Soft delete a blog post.
        """
        db_blog_post = self.get_blog_post(db, post_id)
        if db_blog_post is None:
            return None
            
        db_blog_post.is_active = False
        db.commit()
        db.refresh(db_blog_post)
        return db_blog_post

    def publish_blog_post(
        self, 
        db: Session, 
        post_id: int
    ) -> Optional[BlogPost]:
        """
        Publish a blog post.
        """
        db_blog_post = self.get_blog_post(db, post_id)
        if db_blog_post is None:
            return None
            
        db_blog_post.is_published = True
        db_blog_post.published_at = datetime.utcnow()
        db.commit()
        db.refresh(db_blog_post)
        return db_blog_post

    def unpublish_blog_post(
        self, 
        db: Session, 
        post_id: int
    ) -> Optional[BlogPost]:
        """
        Unpublish a blog post.
        """
        db_blog_post = self.get_blog_post(db, post_id)
        if db_blog_post is None:
            return None
            
        db_blog_post.is_published = False
        db.commit()
        db.refresh(db_blog_post)
        return db_blog_post

blog_service = BlogService()
