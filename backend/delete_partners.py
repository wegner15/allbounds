from app.db.database import SessionLocal
from sqlalchemy import text

def delete_all_partners():
    db = SessionLocal()
    try:
        # First, set partner_id to NULL on bookings to prevent foreign key constraint violations
        print("1. Removing partner associations from bookings...")
        # We use a raw SQL query or check if table exists / columns exist
        db.execute(text("UPDATE bookings SET partner_id = NULL, partner_code = NULL"))
        
        # Then, delete all partners
        print("2. Deleting all partners...")
        db.execute(text("DELETE FROM partners"))
        
        db.commit()
        print("Successfully deleted all partners and cleared bookings associations.")
    except Exception as e:
        print(f"Error during deletion: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_all_partners()
