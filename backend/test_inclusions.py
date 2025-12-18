import requests
import json

# Test the comprehensive endpoint
try:
    # First get a list of packages
    response = requests.get('http://localhost:8005/api/v1/packages?limit=5')
    if response.status_code == 200:
        packages = response.json()
        print(f'Found {len(packages)} packages\n')
        
        if packages:
            # Test the first package
            slug = packages[0]['slug']
            print(f'Testing package: {slug}\n')
            
            response2 = requests.get(f'http://localhost:8005/api/v1/packages/comprehensive/{slug}')
            if response2.status_code == 200:
                data = response2.json()
                print(f'Inclusions: {len(data.get("inclusion_items", []))}')
                print(f'Exclusions: {len(data.get("exclusion_items", []))}\n')
                
                if data.get('inclusion_items'):
                    print('Sample Inclusion:')
                    print(json.dumps(data['inclusion_items'][0], indent=2))
                    print()
                    
                if data.get('exclusion_items'):
                    print('Sample Exclusion:')
                    print(json.dumps(data['exclusion_items'][0], indent=2))
            else:
                print(f'Comprehensive endpoint error: {response2.status_code}')
                print(response2.text)
    else:
        print(f'Packages list error: {response.status_code}')
except Exception as e:
    print(f'Exception: {e}')
