from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.country_visit_info import CountryVisitInfo
from app.schemas.country_visit_info import CountryVisitInfoCreate, CountryVisitInfoUpdate

class CountryVisitInfoService:
    def get_country_visit_info(self, db: Session, country_id: int) -> Optional[CountryVisitInfo]:
        """
        Get visit information for a specific country
        """
        return db.query(CountryVisitInfo).filter(CountryVisitInfo.country_id == country_id).first()

    def create_country_visit_info(self, db: Session, visit_info: CountryVisitInfoCreate) -> CountryVisitInfo:
        """
        Create visit information for a country
        """
        db_visit_info = CountryVisitInfo(
            country_id=visit_info.country_id,
            monthly_ratings=visit_info.model_dump()["monthly_ratings"],
            general_notes=visit_info.general_notes
        )
        db.add(db_visit_info)
        db.commit()
        db.refresh(db_visit_info)
        return db_visit_info

    def update_country_visit_info(
        self, db: Session, country_id: int, visit_info: CountryVisitInfoUpdate
    ) -> Optional[CountryVisitInfo]:
        """
        Update visit information for a country
        """
        db_visit_info = self.get_country_visit_info(db, country_id)
        
        if not db_visit_info:
            # If no visit info exists, create it
            return self.create_country_visit_info(
                db, 
                CountryVisitInfoCreate(
                    country_id=country_id,
                    monthly_ratings=visit_info.monthly_ratings if visit_info.monthly_ratings is not None else [],
                    general_notes=visit_info.general_notes
                )
            )
        
        # Update existing visit info
        update_data = visit_info.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_visit_info, key, value)
        
        db.commit()
        db.refresh(db_visit_info)
        return db_visit_info

    def delete_country_visit_info(self, db: Session, country_id: int) -> bool:
        """
        Delete visit information for a country
        """
        db_visit_info = self.get_country_visit_info(db, country_id)
        if not db_visit_info:
            return False
        
        db.delete(db_visit_info)
        db.commit()
        return True

country_visit_info_service = CountryVisitInfoService()
