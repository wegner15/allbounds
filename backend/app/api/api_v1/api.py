from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    regions,
    countries,
    activities,
    attractions,
    accommodations,
    hotels,
    hotel_types,
    packages,
    group_trips,
    holiday_types,
    blog,
    search,
    media,
    auth,
    users,
    itinerary,
    cloudflare_images,
    newsletter,
    reviews,
    inclusions,
    exclusions,
    package_price_charts,
)

api_router = APIRouter()

# Public read APIs
api_router.include_router(regions.router, prefix="/regions", tags=["Regions"])
api_router.include_router(countries.router, prefix="/countries", tags=["Countries"])
api_router.include_router(activities.router, prefix="/activities", tags=["Activities"])
api_router.include_router(attractions.router, prefix="/attractions", tags=["Attractions"])
api_router.include_router(accommodations.router, prefix="/accommodations", tags=["Accommodations"])
api_router.include_router(hotels.router, prefix="/hotels", tags=["Hotels"])
api_router.include_router(hotel_types.router, prefix="/hotel-types", tags=["Hotel Types"])
api_router.include_router(packages.router, prefix="/packages", tags=["Packages"])
api_router.include_router(group_trips.router, prefix="/group-trips", tags=["Group Trips"])
api_router.include_router(holiday_types.router, prefix="/holiday-types", tags=["Holiday Types"])
api_router.include_router(inclusions.router, prefix="/inclusions", tags=["Inclusions"])
api_router.include_router(exclusions.router, prefix="/exclusions", tags=["Exclusions"])
api_router.include_router(blog.router, prefix="/blog", tags=["Blog"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])

# Media APIs
api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(newsletter.router, prefix="/newsletter", tags=["Newsletter"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(cloudflare_images.router, prefix="/cloudflare/images", tags=["Cloudflare Images"])

# Admin APIs
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(itinerary.router, prefix="/itinerary", tags=["Itinerary"])
api_router.include_router(package_price_charts.router, prefix="", tags=["Package Price Charts"])
