#!/usr/bin/env python3
"""
Script to fix Meilisearch indexing to use batched queries instead of .all()
This prevents OOM errors when indexing large datasets.
"""

import re

# Read the current file
with open('app/services/search.py', 'r') as f:
    content = f.read()

# Define the replacement patterns for each index method
replacements = [
    # Regions
    (
        r'(    def index_regions\(self, db: Session\) -> bool:\n        """\n        Index all active regions\..*?\n        """)\n        regions = db\.query\(Region\)\.filter\(Region\.is_active == True\)\.all\(\)\n        \n        documents = \[\]\n        for region in regions:',
        r'\1\n        BATCH_SIZE = 100\n        offset = 0\n        success = True\n        \n        while True:\n            regions = db.query(Region).filter(Region.is_active == True).offset(offset).limit(BATCH_SIZE).all()\n            \n            if not regions:\n                break\n            \n            documents = []\n            for region in regions:'
    ),
    (
        r'(\n        return self\.meilisearch_client\.add_documents\(self\.REGION_INDEX, documents\))',
        r'\n            \n            if not self.meilisearch_client.add_documents(self.REGION_INDEX, documents):\n                success = False\n            \n            offset += BATCH_SIZE\n            db.expunge_all()\n        \n        return success'
    ),
]

print("Applying batched query fixes...")
print(f"File size: {len(content)} chars")

# Apply each replacement
for i, (pattern, replacement) in enumerate(replacements):
    before = content
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    if content != before:
        print(f"✓ Applied replacement {i+1}")
    else:
        print(f"✗ Failed to apply replacement {i+1}")

# Write the fixed content
with open('app/services/search.py', 'w') as f:
    f.write(content)

print("Done!")
