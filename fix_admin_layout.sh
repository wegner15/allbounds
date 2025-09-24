#!/bin/bash

# Function to fix a component file by removing AdminLayout
fix_component_file() {
    local file=$1
    
    # Remove AdminLayout import
    sed -i "s/import AdminLayout from '..\/..\/..\/components\/layout\/AdminLayout';//g" "$file"
    
    # Replace AdminLayout wrapper with fragment
    sed -i 's/<AdminLayout title="[^"]*">/</g' "$file"
    sed -i 's/<\/AdminLayout>/<\/>/g' "$file"
    
    echo "Fixed $file"
}

# Fix all inclusion/exclusion components
for dir in /home/nashon/MyCode/allbounds/frontend/src/features/admin/inclusions /home/nashon/MyCode/allbounds/frontend/src/features/admin/exclusions; do
    for file in "$dir"/*.tsx; do
        fix_component_file "$file"
    done
done

echo "All files fixed!"
