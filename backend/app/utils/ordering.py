from typing import List, Type, Any
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.redis_cache import invalidate_cache_pattern


def ensure_normalized_order(db: Session, model: Type[Any]) -> None:
    """
    Ensure every row in `model.__tablename__` has a unique, positive 1-based `order_index` (1..N).

    - If more than one row has `order_index = 0`, the table was never backfilled (or was partially
      updated while un-initialized), so we backfill `1..N` ordered by `created_at DESC, id DESC`.
    - Otherwise, if any row has `order_index <= 0` (e.g., newly created items) or duplicate
      `order_index` values exist, we re-number `1..N` preserving `order_index ASC, created_at DESC, id DESC`.
    """
    table = model.__tablename__
    stats = db.execute(
        text(
            f"""
            SELECT
                COUNT(*) AS total_count,
                COUNT(*) FILTER (WHERE order_index = 0) AS zero_count,
                MIN(order_index) AS min_order,
                COUNT(DISTINCT order_index) AS distinct_count
            FROM {table}
            """
        )
    ).mappings().first()

    if not stats or stats["total_count"] == 0:
        return

    total_count = stats["total_count"]
    zero_count = stats["zero_count"]
    min_order = stats["min_order"]
    distinct_count = stats["distinct_count"]

    if zero_count > 1:
        db.execute(
            text(
                f"""
                UPDATE {table} t
                SET order_index = s.rn
                FROM (
                    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC, id DESC) AS rn
                    FROM {table}
                ) s
                WHERE t.id = s.id
                """
            )
        )
        db.commit()
        invalidate_cache_pattern("cache:*")
    elif (min_order is not None and min_order <= 0) or distinct_count < total_count:
        db.execute(
            text(
                f"""
                UPDATE {table} t
                SET order_index = s.rn
                FROM (
                    SELECT id, ROW_NUMBER() OVER (ORDER BY order_index ASC, created_at DESC, id DESC) AS rn
                    FROM {table}
                ) s
                WHERE t.id = s.id
                """
            )
        )
        db.commit()
        invalidate_cache_pattern("cache:*")


def apply_page_reorder(db: Session, model: Type[Any], orders: List[dict]) -> bool:
    """
    Reorder a subset (page) of rows safely:
    1. Ensures the table has normalized, unique 1..N `order_index` values.
    2. Takes the desired sequence of IDs from `orders` (sorted by requested `order_index` ascending).
    3. Fetches the actual current `order_index` slots occupied by those IDs in the database,
       sorts those slots ascending, and reassigns them to the IDs in their new sequence.
    """
    try:
        ensure_normalized_order(db, model)
        if not orders:
            return True

        ordered_ids = [
            int(o["id"])
            for o in sorted(orders, key=lambda x: (x.get("order_index", 0), x.get("id", 0)))
        ]
        rows = (
            db.query(model.id, model.order_index)
            .filter(model.id.in_(ordered_ids))
            .all()
        )
        if not rows:
            return True

        slots = sorted(int(r.order_index) for r in rows)
        existing_ids_set = {int(r.id) for r in rows}
        valid_ordered_ids = [item_id for item_id in ordered_ids if item_id in existing_ids_set]

        mappings = [
            {"id": item_id, "order_index": slot}
            for item_id, slot in zip(valid_ordered_ids, slots)
        ]
        if mappings:
            db.bulk_update_mappings(model, mappings)
        db.commit()
        invalidate_cache_pattern("cache:*")
        return True
    except Exception as e:
        db.rollback()
        print(f"Error reordering {model.__tablename__}: {e}")
        return False
