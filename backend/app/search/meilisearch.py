import logging
from typing import Dict, List, Any, Optional, Union
import meilisearch
from meilisearch.errors import MeilisearchError

from app.core.config import settings

logger = logging.getLogger(__name__)

class MeilisearchClient:
    """
    Meilisearch client for handling search functionality.
    """
    
    def __init__(self):
        """
        Initialize the Meilisearch client using settings.
        """
        self.url = settings.MEILISEARCH_URL
        self.master_key = settings.MEILISEARCH_MASTER_KEY
        
        # Initialize the Meilisearch client
        self.client = None
        if self.url:
            self.client = meilisearch.Client(self.url, self.master_key)

    def _extract_task_uid(self, task_result: Any) -> Optional[int]:
        """
        Extract a Meilisearch task UID from a task response object.

        The Python SDK may return either a TaskInfo object or a dictionary-like
        payload depending on the operation and version.
        """
        if task_result is None:
            return None

        if isinstance(task_result, dict):
            for key in ("task_uid", "taskUid", "uid", "task_id", "taskId"):
                value = task_result.get(key)
                if value is not None:
                    return value

        for attr in ("task_uid", "taskUid", "uid", "task_id", "taskId"):
            value = getattr(task_result, attr, None)
            if value is not None:
                return value

        return None

    def _wait_for_task(self, task_result: Any, action: str) -> bool:
        """
        Wait for a Meilisearch task to finish before returning success.
        """
        task_uid = self._extract_task_uid(task_result)
        if task_uid is None:
            logger.warning(f"Meilisearch {action} did not return a task UID")
            return True

        try:
            self.client.wait_for_task(task_uid)
            return True
        except Exception as e:
            logger.error(f"Error waiting for Meilisearch task during {action}: {e}")
            return False
    
    def is_configured(self) -> bool:
        """
        Check if Meilisearch is properly configured.
        
        Returns:
            bool: True if Meilisearch is configured, False otherwise
        """
        return self.client is not None
    
    def health_check(self) -> bool:
        """
        Check if Meilisearch is healthy.
        
        Returns:
            bool: True if Meilisearch is healthy, False otherwise
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return False
        
        try:
            health = self.client.health()
            return health.get('status') == 'available'
        except Exception as e:
            logger.error(f"Error checking Meilisearch health: {e}")
            return False
    
    def create_index(self, index_name: str, primary_key: str = 'id') -> bool:
        """
        Create a new index in Meilisearch.
        
        Args:
            index_name: Name of the index
            primary_key: Primary key field name
            
        Returns:
            bool: True if index was created successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return False
        
        try:
            task = self.client.create_index(index_name, {'primaryKey': primary_key})
            return self._wait_for_task(task, f"create_index({index_name})")
        except MeilisearchError as e:
            # If index already exists, consider it a success
            if 'index_already_exists' in str(e):
                return True
            logger.error(f"Error creating Meilisearch index: {e}")
            return False
    
    def delete_index(self, index_name: str) -> bool:
        """
        Delete an index from Meilisearch.
        
        Args:
            index_name: Name of the index
            
        Returns:
            bool: True if index was deleted successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return False
        
        try:
            task = self.client.delete_index(index_name)
            return self._wait_for_task(task, f"delete_index({index_name})")
        except MeilisearchError as e:
            logger.error(f"Error deleting Meilisearch index: {e}")
            return False
    
    def get_index(self, index_name: str) -> Optional[meilisearch.index.Index]:
        """
        Get an index from Meilisearch.
        
        Args:
            index_name: Name of the index
            
        Returns:
            Index object or None if not found or error
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return None
        
        try:
            return self.client.get_index(index_name)
        except MeilisearchError as e:
            logger.error(f"Error getting Meilisearch index: {e}")
            return None
    
    def add_documents(self, index_name: str, documents: List[Dict[str, Any]]) -> bool:
        """
        Add documents to a Meilisearch index.
        
        Args:
            index_name: Name of the index
            documents: List of documents to add
            
        Returns:
            bool: True if documents were added successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return False

        if not documents:
            logger.info(f"Skipping add_documents for {index_name}: no documents to index")
            return True
        
        try:
            index = self.get_index(index_name)
            if not index:
                return False
            
            task = index.add_documents(documents)
            return self._wait_for_task(task, f"add_documents({index_name})")
        except MeilisearchError as e:
            logger.error(f"Error adding documents to Meilisearch: {e}")
            return False
    
    def update_documents(self, index_name: str, documents: List[Dict[str, Any]]) -> bool:
        """
        Update documents in a Meilisearch index.
        
        Args:
            index_name: Name of the index
            documents: List of documents to update
            
        Returns:
            bool: True if documents were updated successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return False

        if not documents:
            logger.info(f"Skipping update_documents for {index_name}: no documents to update")
            return True
        
        try:
            index = self.get_index(index_name)
            if not index:
                return False
            
            task = index.update_documents(documents)
            return self._wait_for_task(task, f"update_documents({index_name})")
        except MeilisearchError as e:
            logger.error(f"Error updating documents in Meilisearch: {e}")
            return False
    
    def delete_document(self, index_name: str, document_id: Union[str, int]) -> bool:
        """
        Delete a document from a Meilisearch index.
        
        Args:
            index_name: Name of the index
            document_id: ID of the document to delete
            
        Returns:
            bool: True if document was deleted successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return False
        
        try:
            index = self.get_index(index_name)
            if not index:
                return False
            
            task = index.delete_document(document_id)
            return self._wait_for_task(task, f"delete_document({index_name})")
        except MeilisearchError as e:
            logger.error(f"Error deleting document from Meilisearch: {e}")
            return False
    
    def search(self, index_name: str, query: str, limit: int = 20, offset: int = 0,
              filter: Optional[str] = None, sort: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Search documents in a Meilisearch index.
        
        Args:
            index_name: Name of the index
            query: Search query
            limit: Maximum number of results to return
            offset: Number of results to skip
            filter: Filter expression
            sort: List of sort expressions
            
        Returns:
            dict: Search results or empty dict if error
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return {}
        
        try:
            index = self.get_index(index_name)
            if not index:
                return {}
            
            search_params = {
                'limit': limit,
                'offset': offset,
            }
            
            if filter:
                search_params['filter'] = filter
            
            if sort:
                search_params['sort'] = sort
            
            return index.search(query, search_params)
        except MeilisearchError as e:
            logger.error(f"Error searching in Meilisearch: {e}")
            return {}
    
    def configure_index_settings(self, index_name: str, settings: Dict[str, Any]) -> bool:
        """
        Configure settings for a Meilisearch index.
        
        Args:
            index_name: Name of the index
            settings: Dictionary of settings
            
        Returns:
            bool: True if settings were configured successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("Meilisearch is not configured")
            return False
        
        try:
            # Try to get the index, if it doesn't exist, create it first
            index = self.get_index(index_name)
            if not index:
                # Create the index if it doesn't exist
                if not self.create_index(index_name):
                    return False
                index = self.get_index(index_name)
                if not index:
                    return False
            
            task = index.update_settings(settings)
            return self._wait_for_task(task, f"update_settings({index_name})")
        except MeilisearchError as e:
            logger.error(f"Error configuring Meilisearch index settings: {e}")
            return False

# Create a singleton instance
meilisearch_client = MeilisearchClient()
