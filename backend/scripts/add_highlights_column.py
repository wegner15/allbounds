import os
from sqlalchemy import create_engine, text

def migrate():
    db_url = os.getenv("DATABASE_URL", "postgresql://allbounds:allbounds@db:5432/allbounds")
    print(f"Connecting to database: {db_url}")
    
    engine = create_engine(db_url)
    with engine.begin() as conn:
        try:
            if "sqlite" in db_url:
                conn.execute(text("ALTER TABLE countries ADD COLUMN highlights JSON;"))
            else:
                conn.execute(text("ALTER TABLE countries ADD COLUMN IF NOT EXISTS highlights JSONB;"))
            print("Successfully added 'highlights' column to 'countries' table.")
        except Exception as e:
            print(f"Database migration note: {e}")

if __name__ == "__main__":
    migrate()
