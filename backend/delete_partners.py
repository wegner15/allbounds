from app.db.database import SessionLocal
from sqlalchemy import text

def delete_all_partners():
    db = SessionLocal()
    try:
        # Delete all partners from the partners table
        print("1. Deleting all partners...")
        db.execute(text("DELETE FROM partners"))
        
        db.commit()
        print("Successfully deleted all partners.")
    except Exception as e:
        print(f"Error during deletion: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_all_partners()
