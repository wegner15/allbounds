"""
Direct test of the comprehensive endpoint to see the actual error
"""
import sys
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.services.package import package_service

def test_comprehensive_endpoint():
    db: Session = SessionLocal()
    try:
        print("Testing comprehensive endpoint...")
        print("=" * 60)
        
        slug = "ultimate-highland-to-savannah-safari"
        print(f"\nFetching package: {slug}")
        
        try:
            package = package_service.get_comprehensive_package_by_slug(db, slug=slug)
            
            if package is None:
                print("❌ Package not found!")
                return
            
            print(f"✅ Package found: {package.name}")
            print(f"   ID: {package.id}")
            print(f"   Slug: {package.slug}")
            print(f"   Is Active: {package.is_active}")
            print()
            
            # Check each relationship
            print("Checking relationships:")
            print(f"  - Country: {package.country.name if package.country else 'None'}")
            print(f"  - Holiday Types: {len(package.holiday_types) if package.holiday_types else 0}")
            print(f"  - Media Assets: {len(package.media_assets) if package.media_assets else 0}")
            print(f"  - Itinerary Items: {len(package.itinerary_items) if package.itinerary_items else 0}")
            print(f"  - Inclusion Items: {len(package.inclusion_items) if package.inclusion_items else 0}")
            print(f"  - Exclusion Items: {len(package.exclusion_items) if package.exclusion_items else 0}")
            print(f"  - Hotels: {len(package.hotels) if package.hotels else 0}")
            print(f"  - Attractions: {len(package.attractions) if package.attractions else 0}")
            print(f"  - Reviews: {len(package.reviews) if package.reviews else 0}")
            print(f"  - Price Charts: {len(package.price_charts) if package.price_charts else 0}")
            print()
            
            # Check inclusions in detail
            if package.inclusion_items:
                print("Inclusions:")
                for inc in package.inclusion_items[:3]:
                    print(f"  - {inc.name} (icon: {inc.icon}, category: {inc.category})")
            
            # Check exclusions in detail
            if package.exclusion_items:
                print("\nExclusions:")
                for exc in package.exclusion_items[:3]:
                    print(f"  - {exc.name} (icon: {exc.icon}, category: {exc.category})")
            
            print("\n✅ SUCCESS - No errors!")
            
        except Exception as e:
            print(f"\n❌ ERROR: {type(e).__name__}")
            print(f"   Message: {str(e)}")
            import traceback
            print("\nFull traceback:")
            traceback.print_exc()
            
    finally:
        db.close()

if __name__ == "__main__":
    test_comprehensive_endpoint()
