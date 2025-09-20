from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

# Schema for search query
class SearchQuery(BaseModel):
    query: str = Field(..., description="Search query")
    index: Optional[str] = Field(None, description="Optional index name to search in a specific index")
    limit: int = Field(20, description="Maximum number of results to return")
    offset: int = Field(0, description="Number of results to skip")
    filter: Optional[str] = Field(None, description="Filter expression")
    sort: Optional[List[str]] = Field(None, description="List of sort expressions")

# Schema for search results
class SearchResults(BaseModel):
    hits: List[Dict[str, Any]] = Field(..., description="Search results")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")
    query: str = Field(..., description="Search query")
    limit: int = Field(..., description="Maximum number of results returned")
    offset: int = Field(..., description="Number of results skipped")
    estimated_total_hits: int = Field(..., description="Estimated total number of hits")

# Schema for multi-index search results
class MultiSearchResults(BaseModel):
    results: Dict[str, SearchResults] = Field(..., description="Search results by index")

# Schema for indexing status
class IndexingStatus(BaseModel):
    success: bool = Field(..., description="Whether indexing was successful")
    message: str = Field(..., description="Status message")
    details: Optional[Dict[str, bool]] = Field(None, description="Detailed status by index")
