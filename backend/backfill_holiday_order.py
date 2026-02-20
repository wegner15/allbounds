from app.db.database import SessionLocal
from app.models.holiday_type import HolidayType

def backfill_order_index():
    db = SessionLocal()
    try:
        # Get all holiday types where order_index is NULL
        holiday_types = db.query(HolidayType).filter(HolidayType.order_index == None).all()
        print(f"Found {len(holiday_types)} holiday types with NULL order_index")
        
        for ht in holiday_types:
            ht.order_index = 0
            
        db.commit()
        print("Successfully backfilled order_index with 0")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    backfill_order_index()
