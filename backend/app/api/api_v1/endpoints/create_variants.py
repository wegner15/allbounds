"""
API endpoint for creating Cloudflare Images variants.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models.user import User
from app.auth.dependencies import get_current_user, has_permission
from app.services.cloudflare_images import cloudflare_images_service
from app.schemas.cloudflare_images import VariantResponse

router = APIRouter()

@router.post("/create-default-variants", response_model=List[VariantResponse])
def create_default_variants(
    current_user: User = Depends(has_permission("media:manage"))
) -> List[VariantResponse]:
    """
    Create default image variants in Cloudflare Images.
    Requires media:manage permission.
    """
    variants = [
        {
            "id": "thumbnail",
            "options": {
                "width": 200,
                "height": 200,
                "fit": "cover",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        },
        {
            "id": "medium",
            "options": {
                "width": 800,
                "height": 600,
                "fit": "scale-down",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        },
        {
            "id": "large",
            "options": {
                "width": 1200,
                "height": 900,
                "fit": "scale-down",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        }
    ]
    
    results = []
    errors = []
    
    for variant in variants:
        try:
            response = cloudflare_images_service.create_variant(
                variant_id=variant["id"],
                options=variant["options"],
                never_require_signed_urls=variant["never_require_signed_urls"]
            )
            
            if response.get("success"):
                result = response.get("result", {})
                results.append(VariantResponse(
                    id=result.get("id"),
                    options=result.get("options", {}),
                    never_require_signed_urls=result.get("neverRequireSignedURLs", False)
                ))
            else:
                errors_list = response.get("errors", [])
                if errors_list and errors_list[0].get("code") == 10007:  # Variant already exists
                    # Add to results anyway since it exists
                    results.append(VariantResponse(
                        id=variant["id"],
                        options=variant["options"],
                        never_require_signed_urls=variant["never_require_signed_urls"]
                    ))
                else:
                    error_msg = f"Failed to create variant {variant['id']}: {errors_list}"
                    errors.append(error_msg)
        except Exception as e:
            errors.append(f"Error creating variant {variant['id']}: {str(e)}")
    
    if errors and not results:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to create any variants", "errors": errors}
        )
    
    return results
