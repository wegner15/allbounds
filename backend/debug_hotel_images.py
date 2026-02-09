
import sys
import os

# Add the current directory to sys.path to make app module importable
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.hotel import Hotel

def check_hotel_images():
    db = SessionLocal()
    try:
        hotels = db.query(Hotel).all()
        print(f"Found {len(hotels)} hotels.")
        for hotel in hotels:
            print(f"ID: {hotel.id}, Name: {hotel.name}, Image ID: {hotel.image_id}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_hotel_images()
