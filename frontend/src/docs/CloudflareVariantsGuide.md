# Creating Cloudflare Image Variants

This guide explains how to create the necessary image variants for the AllBounds application.

## Using the API Endpoint

We've added a dedicated API endpoint to create all the required image variants in one request:

```
POST /api/v1/images/create-default-variants
```

This endpoint requires authentication with a user that has the `media:manage` permission.

### How to Use

1. **Using curl from your host machine**:

```bash
curl -X POST "http://localhost:8005/api/v1/images/create-default-variants" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

2. **Using curl from inside the Docker container**:

```bash
# First, get a shell in the container
docker exec -it allbounds_backend /bin/bash

# Then run the curl command
curl -X POST "http://localhost:8000/api/v1/images/create-default-variants" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

3. **Using the Swagger UI**:
   - Navigate to `http://localhost:8005/docs`
   - Click "Authorize" and enter your token
   - Find the `/images/create-default-variants` endpoint
   - Click "Try it out" and then "Execute"

### What Variants Are Created

The endpoint creates the following variants:

1. **thumbnail**:
   - Width: 200px
   - Height: 200px
   - Fit: cover (crops to fill the dimensions)
   - Public access: Yes

2. **medium**:
   - Width: 800px
   - Height: 600px
   - Fit: scale-down (maintains aspect ratio)
   - Public access: Yes

3. **large**:
   - Width: 1200px
   - Height: 900px
   - Fit: scale-down (maintains aspect ratio)
   - Public access: Yes

## Verifying Variants

After creating the variants, you can verify they exist by:

1. Checking the Cloudflare dashboard:
   - Go to Cloudflare dashboard > Images > Variants

2. Using the API:
   ```bash
   curl -X GET "http://localhost:8005/api/v1/images/variants" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN"
   ```

## Troubleshooting

If you encounter issues:

1. **403 Forbidden**: Ensure your API token has the correct permissions:
   - Account.Cloudflare Images
   - Account.Account Settings (Read)

2. **422 Unprocessable Entity**: Check that your request is properly formatted.

3. **500 Internal Server Error**: Check the backend logs for details.

## Using Variants in Components

The frontend components have been updated to use 'public' as the default variant, which is always available. If you want to use the custom variants:

```tsx
// Using the thumbnail variant
<CloudflareImage imageId="your-image-id" variant="thumbnail" />

// Using the medium variant
<CloudflareImage imageId="your-image-id" variant="medium" />

// Using the large variant
<CloudflareImage imageId="your-image-id" variant="large" />
```
