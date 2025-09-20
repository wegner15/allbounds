"""
Cloudflare Images configuration module.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class CloudflareSettings(BaseSettings):
    """
    Settings for Cloudflare Images integration.
    """
    # Cloudflare account ID
    account_id: str = ""
    
    # Cloudflare API token with Images permissions
    api_token: str = ""
    
    # Base URL for Cloudflare Images API
    api_base_url: str = "https://api.cloudflare.com/client/v4"
    
    # Default image delivery domain
    delivery_url: str = ""
    
    # Default image variants
    default_variants: list[str] = ["thumbnail", "medium", "large"]
    
    # Whether to require signed URLs by default
    require_signed_urls: bool = False
    
    # Signing key for private images (if using signed URLs)
    signing_key: str = ""
    
    # Model configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        env_prefix="CLOUDFLARE_",
        extra="ignore",
    )


# Create settings instance
cloudflare_settings = CloudflareSettings()
