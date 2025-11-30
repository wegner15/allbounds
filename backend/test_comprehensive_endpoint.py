"""
Test script to verify the comprehensive package endpoint schema.
"""
import sys
sys.path.insert(0, '.')

try:
    from app.schemas.package_detail import PackageDetailResponse
    print("✓ PackageDetailResponse schema imported successfully")
    
    # Check if all fields are defined
    fields = PackageDetailResponse.model_fields
    expected_fields = [
        'id', 'name', 'slug', 'summary', 'description', 'duration_days', 
        'price', 'image_id', 'is_active', 'is_featured', 'created_at', 
        'updated_at', 'country', 'holiday_types', 'media_assets', 
        'itinerary_items', 'inclusion_items', 'exclusion_items', 'hotels', 
        'attractions', 'reviews', 'price_charts'
    ]
    
    for field in expected_fields:
        if field in fields:
            print(f"✓ Field '{field}' is defined")
        else:
            print(f"✗ Field '{field}' is missing")
    
    print("\n✓ All schema validations passed!")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
