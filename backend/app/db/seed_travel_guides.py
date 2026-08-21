import logging
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
import app.models.all_models  # Import all models to ensure mappers are initialized
from app.models.travel_guide import TravelGuideCategory, TravelGuideItem
from app.models.country import Country

logger = logging.getLogger(__name__)

DEFAULT_CATEGORIES = [
    {"id": 1, "name": "Good to Know", "slug": "good-to-know", "icon": "ℹ️", "order_index": 1},
    {"id": 2, "name": "Things to Do", "slug": "things-to-do", "icon": "🎯", "order_index": 2},
    {"id": 3, "name": "Going Out", "slug": "going-out", "icon": "🌃", "order_index": 3},
    {"id": 4, "name": "Shopping", "slug": "shopping", "icon": "🛍️", "order_index": 4},
    {"id": 5, "name": "Beaches", "slug": "beaches", "icon": "🏖️", "order_index": 5},
    {"id": 6, "name": "Food & Drink", "slug": "food-drink", "icon": "🍽️", "order_index": 6},
    {"id": 7, "name": "Sports & Adventure", "slug": "sports", "icon": "🚴", "order_index": 7},
    {"id": 8, "name": "Events & Festivals", "slug": "events", "icon": "🎉", "order_index": 8},
]

STATIC_DATA = {
    "kenya": {
        "good-to-know": [
            {"title": "Visa Requirements", "content": "Most visitors require an Electronic Travel Authorisation (eTA) before entering Kenya.", "icon": "🎫"},
            {"title": "Currency", "content": "Kenyan Shilling (KES). Credit cards are accepted in major hotels/malls, but carry cash for local markets.", "icon": "💵"},
            {"title": "Language", "content": "English and Swahili are official languages. A simple \"Jambo\" (Hello) or \"Asante\" (Thank you) goes a long way.", "icon": "🗣️"},
            {"title": "Best Time to Visit", "content": "July to October is ideal for the Great Migration in Masai Mara. January to March is great for bird watching and diving.", "icon": "📅"}
        ],
        "things-to-do": [
            {"title": "Masai Mara Safari", "content": "Experience the world-famous game reserve, home to the Big Five and the incredible annual wildebeest migration.", "icon": "🦁"},
            {"title": "Amboseli Views", "content": "Marvel at giant elephant herds walking with the breathtaking snow-capped Mount Kilimanjaro in the background.", "icon": "🗻"},
            {"title": "Diani Beach Retreat", "content": "Relax on powder-white sand beaches, take a dhow ride, or try kitesurfing in the crystal-clear Indian Ocean.", "icon": "🏖️"}
        ],
        "sports": [
            {"title": "Athletics & Running", "content": "Visit Iten, the \"Home of Champions\", where world-record-breaking Kenyan long-distance runners train.", "icon": "🏃"},
            {"title": "Kitesurfing in Diani", "content": "Constant winds and flat-water lagoons make Kenya's coast a world-class destination for kitesurfers.", "icon": "🏄"}
        ]
    }
}

def seed_travel_guides(db: Session = None):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        category_map = {}
        # 1. Seed global categories
        for cat_data in DEFAULT_CATEGORIES:
            cat = db.query(TravelGuideCategory).filter(TravelGuideCategory.slug == cat_data["slug"]).first()
            if not cat:
                cat = TravelGuideCategory(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    icon=cat_data["icon"],
                    order_index=cat_data["order_index"],
                    is_active=True
                )
                db.add(cat)
                db.flush()
                logger.info(f"Seeded Travel Guide Category: {cat.name}")
            category_map[cat.slug] = cat.id

        db.commit()

        # 2. Seed static country items if country exists in DB
        for country_slug, categories_data in STATIC_DATA.items():
            country = db.query(Country).filter(Country.slug == country_slug).first()
            if not country:
                continue

            for cat_slug, items in categories_data.items():
                cat_id = category_map.get(cat_slug)
                if not cat_id:
                    continue

                for idx, item_data in enumerate(items):
                    existing = db.query(TravelGuideItem).filter(
                        TravelGuideItem.country_id == country.id,
                        TravelGuideItem.category_id == cat_id,
                        TravelGuideItem.title == item_data["title"]
                    ).first()
                    if not existing:
                        item = TravelGuideItem(
                            country_id=country.id,
                            category_id=cat_id,
                            title=item_data["title"],
                            content=item_data["content"],
                            icon=item_data.get("icon"),
                            order_index=idx,
                            is_active=True
                        )
                        db.add(item)
                        logger.info(f"Seeded Travel Guide Item for {country.name}: {item.title}")

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding travel guides: {e}")
    finally:
        if close_session:
            db.close()

if __name__ == "__main__":
    seed_travel_guides()
