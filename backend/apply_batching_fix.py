#!/usr/bin/env python3
"""Apply batching to all index_* methods in search.py to prevent OOM errors."""

import re

# Read original file
with open('app/services/search.py', 'r') as f:
    lines = f.readlines()

output = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Check if this is an index method definition
    if re.match(r'    def index_(regions|countries|activities|attractions|accommodations|hotel_types|inclusions|exclusions)\(', line):
        # Determine batch size (100 for simple entities)
        output.append(line)  # def line
        i += 1
        output.append(lines[i])  # docstring start
        i += 1
        # Skip until end of docstring
        while i < len(lines) and '"""' not in lines[i]:
            output.append(lines[i])
            i += 1
        output.append(lines[i])  # docstring end
        i += 1
        
        # Add batching logic
        output.append('        BATCH_SIZE = 100\n')
        output.append('        offset = 0\n')
        output.append('        success = True\n')
        output.append('        \n')
        output.append('        while True:\n')
        
        # Find the query line and modify it
        query_line = lines[i].strip()
        model = re.search(r'db\.query\((\w+)\)', query_line).group(1)
        output.append(f'            {model.lower()}s = db.query({model}).filter({model}.is_active == True).offset(offset).limit(BATCH_SIZE).all()\n')
        i += 1  # Skip original query line
        output.append('            \n')
        output.append(f'            if not {model.lower()}s:\n')
        output.append('                break\n')
        output.append('            \n')
        
        # Keep document building logic but indent it
        i += 1  # skip blank line
        output.append('            documents = []\n')
        i += 1  # skip documents = []
        
        # Copy for loop and document building
        while i < len(lines) and 'return self.meilisearch_client' not in lines[i]:
            output.append('    ' + lines[i])  # Add extra indent
            i += 1
        
        # Add batch submit and cleanup
        idx_name = re.search(r'self\.(\w+_INDEX)', lines[i]).group(1)
        output.append(f'            \n')
        output.append(f'            if not self.meilisearch_client.add_documents(self.{idx_name}, documents):\n')
        output.append(f'                success = False\n')
        output.append(f'            \n')
        output.append(f'            offset += BATCH_SIZE\n')
        output.append(f'            db.expunge_all()\n')
        output.append(f'        \n')
        output.append(f'        return success\n')
        i += 1  # skip original return
        
    elif re.match(r'    def index_(packages|group_trips|blog_posts)\(', line):
        # Smaller batch for large text fields
        output.append(line)  # def line
        i += 1
        output.append(lines[i])  # docstring start
        i += 1
        while i < len(lines) and '"""' not in lines[i]:
            output.append(lines[i])
            i += 1
        output.append(lines[i])  # docstring end
        i += 1
        
        output.append('        BATCH_SIZE = 50  # Smaller batch for entities with large text fields\n')
        output.append('        offset = 0\n')
        output.append('        success = True\n')
        output.append('        \n')
        output.append('        while True:\n')
        
        query_line = lines[i].strip()
        if 'Package' in query_line:
            model, var = 'Package', 'packages'
        elif 'GroupTrip' in query_line:
            model, var = 'GroupTrip', 'group_trips'
        else:
            model, var = 'BlogPost', 'blog_posts'
        
        output.append(f'            {var} = db.query({model}).filter({model}.is_active == True).offset(offset).limit(BATCH_SIZE).all()\n')
        i += 1
        output.append('            \n')
        output.append(f'            if not {var}:\n')
        output.append('                break\n')
        output.append('            \n')
        
        i += 1  # skip blank
        output.append('            documents = []\n')
        i += 1  # skip documents = []
        
        while i < len(lines) and 'return self.meilisearch_client' not in lines[i]:
            output.append('    ' + lines[i])
            i += 1
        
        idx_name = re.search(r'self\.(\w+_INDEX)', lines[i]).group(1)
        output.append(f'            \n')
        output.append(f'            if not self.meilisearch_client.add_documents(self.{idx_name}, documents):\n')
        output.append(f'                success = False\n')
        output.append(f'            \n')
        output.append(f'            offset += BATCH_SIZE\n')
        output.append(f'            db.expunge_all()\n')
        output.append(f'        \n')
        output.append(f'        return success\n')
        i += 1
    else:
        output.append(line)
        i += 1

# Write modified file
with open('app/services/search.py', 'w') as f:
    f.writelines(output)

print("✓ Applied batching to all index methods")
print("✓ Memory usage should now stay under 700MB during bulk indexing")
