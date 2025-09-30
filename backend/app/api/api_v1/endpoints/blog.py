from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.blog import BlogPost
from app.models.user import User
from app.schemas.blog import BlogPostResponse, BlogPostCreate, BlogPostUpdate
from app.services.blog import blog_service
from app.services.audit import create_audit_log
from app.auth.dependencies import get_current_active_superuser, get_current_user, get_current_user_optional
from app.utils.slug import create_slug

router = APIRouter()

@router.get("/", response_model=List[BlogPostResponse])
def read_blog_posts(
    skip: int = 0,
    limit: int = 100,
    include_drafts: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retrieve all blog posts.
    For admin users, can include draft posts by setting include_drafts=true.
    """
    # If user is superuser and requests drafts, show all posts
    if current_user and current_user.is_superuser and include_drafts:
        blog_posts = blog_service.get_blog_posts(db, skip=skip, limit=limit, active_only=True, published_only=False)
    else:
        # Default behavior: only published posts
        blog_posts = blog_service.get_blog_posts(db, skip=skip, limit=limit)
    return blog_posts

@router.get("/{post_id}", response_model=BlogPostResponse)
def read_blog_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific blog post by ID.
    """
    blog_post = blog_service.get_blog_post(db, post_id=post_id)
    if blog_post is None or not blog_post.is_published or not blog_post.is_active:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog_post

@router.get("/slug/{slug}", response_model=BlogPostResponse)
def read_blog_post_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific blog post by slug.
    """
    blog_post = blog_service.get_blog_post_by_slug(db, slug=slug)
    if blog_post is None or not blog_post.is_published or not blog_post.is_active:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog_post

@router.post("/", response_model=BlogPostResponse)
def create_blog_post(
    blog_post_in: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Create a new blog post.
    """
    # Generate slug from title if not provided
    if not hasattr(blog_post_in, "slug") or not blog_post_in.slug:
        slug = create_slug(blog_post_in.title)
    else:
        slug = blog_post_in.slug
        
    # Check if blog post with this slug already exists
    db_blog_post = blog_service.get_blog_post_by_slug(db, slug=slug)
    if db_blog_post:
        raise HTTPException(
            status_code=400,
            detail=f"Blog post with slug '{slug}' already exists"
        )
    
    # Create blog post
    blog_post = blog_service.create_blog_post(
        db=db,
        title=blog_post_in.title,
        content=blog_post_in.content,
        summary=blog_post_in.summary,
        author_id=current_user.id,
        cover_image_id=blog_post_in.cover_image_id,
        slug=slug,
        tags=blog_post_in.tags
    )

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="create",
        entity_type="blog_post",
        entity_id=blog_post.id
    )

    return blog_post

@router.put("/{post_id}", response_model=BlogPostResponse)
def update_blog_post(
    post_id: int,
    blog_post_in: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Update a blog post.
    """
    blog_post = blog_service.get_blog_post(db, post_id=post_id)
    if blog_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    blog_post = blog_service.update_blog_post(
        db=db,
        post_id=post_id,
        title=blog_post_in.title,
        content=blog_post_in.content,
        summary=blog_post_in.summary,
        cover_image_id=blog_post_in.cover_image_id,
        tags=blog_post_in.tags,
        is_published=blog_post_in.is_published,
        is_active=blog_post_in.is_active
    )

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="update",
        entity_type="blog_post",
        entity_id=post_id
    )

    return blog_post

@router.delete("/{post_id}", response_model=BlogPostResponse)
def delete_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Delete a blog post.
    """
    blog_post = blog_service.get_blog_post(db, post_id=post_id)
    if blog_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    blog_post = blog_service.delete_blog_post(db, post_id=post_id)

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="delete",
        entity_type="blog_post",
        entity_id=post_id
    )

    return blog_post

@router.post("/{post_id}/publish", response_model=BlogPostResponse)
def publish_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Publish a blog post.
    """
    blog_post = blog_service.get_blog_post(db, post_id=post_id)
    if blog_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    blog_post = blog_service.publish_blog_post(db, post_id=post_id)

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="publish",
        entity_type="blog_post",
        entity_id=post_id
    )

    return blog_post

@router.post("/{post_id}/unpublish", response_model=BlogPostResponse)
def unpublish_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Unpublish a blog post.
    """
    blog_post = blog_service.get_blog_post(db, post_id=post_id)
    if blog_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    blog_post = blog_service.unpublish_blog_post(db, post_id=post_id)

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="unpublish",
        entity_type="blog_post",
        entity_id=post_id
    )

    return blog_post

@router.post("/{post_id}/feature", response_model=BlogPostResponse)
def feature_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Mark a blog post as featured.
    """
    blog_post = blog_service.get_blog_post(db, post_id=post_id)
    if blog_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    blog_post = blog_service.feature_blog_post(db, post_id=post_id)
    return blog_post

@router.post("/{post_id}/unfeature", response_model=BlogPostResponse)
def unfeature_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Remove featured status from a blog post.
    """
    blog_post = blog_service.get_blog_post(db, post_id=post_id)
    if blog_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    blog_post = blog_service.unfeature_blog_post(db, post_id=post_id)
    return blog_post
