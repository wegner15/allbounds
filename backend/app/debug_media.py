from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.media import MediaAsset
from app.schemas.media import MediaAssetResponse

app = FastAPI()

@app.get("/debug-media/{media_id}", response_model=MediaAssetResponse)
def debug_media(media_id: int, db: Session = Depends(get_db)):
    """Debug endpoint to test MediaAsset response validation."""
    media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    return media

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
