# Leaflet Production Build Issue - Workaround

## Problem
Leaflet has a circular dependency issue in production builds that causes:
```
Uncaught ReferenceError: Cannot access 'qn' before initialization
```

## Root Cause
Leaflet's internal module structure creates circular dependencies when bundled by Vite/Rollup in production mode. This is a known issue with Leaflet in modern bundlers.

## Attempted Solutions
1. ✗ Fixed icon initialization in components
2. ✗ Changed import patterns (from `import { Icon }` to `import L`)
3. ✗ Removed global CSS import
4. ✗ Added Vite-specific Leaflet configuration
5. ✗ Used useEffect for icon fixes

## Recommended Solutions

### Option 1: Upgrade Leaflet (Recommended)
Update to the latest version of Leaflet which may have fixed this issue:
```bash
npm install leaflet@latest react-leaflet@latest
```

### Option 2: Use Alternative Map Library
Consider switching to a more modern alternative:
- **Mapbox GL JS** - Better performance, modern API
- **Google Maps React** - Well-supported, reliable
- **Pigeon Maps** - Lightweight React-first solution

### Option 3: Conditional Loading
Only load maps when explicitly needed (lazy load with error boundary):
```typescript
const MapComponent = lazy(() => import('./MapComponent').catch(() => ({
  default: () => <div>Map unavailable</div>
})));
```

### Option 4: Temporary Disable
Comment out map components in production until a permanent fix is found.

## Current Status
The issue persists despite multiple fix attempts. The problem is in Leaflet's core bundling, not our code.

## Next Steps
1. Test with latest Leaflet version
2. If issue persists, consider switching to Mapbox GL JS
3. As a last resort, disable maps in production temporarily
