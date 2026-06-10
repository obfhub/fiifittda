# Website Views - Implementation Guide

## Quick Start

Website views are now live in your admin panel at `/admin`. They currently show mock data.

## Connecting Real Analytics

### Option 1: Google Analytics 4 (Recommended)

**1. Install dependency:**
```bash
npm install @google-analytics/data
```

**2. Set up Google Cloud service account:**
- Go to Google Cloud Console
- Create service account
- Download JSON credentials file
- Upload to project (keep secure)

**3. Add env vars in Vercel:**
```
GOOGLE_ANALYTICS_PROPERTY_ID=your_ga4_property_id
GOOGLE_APPLICATION_CREDENTIALS_BASE64=base64_of_json_file
```

**4. Update api/admin.js - Replace getWebsiteStats():**

```javascript
async function getWebsiteStats() {
  try {
    const { BetaAnalyticsDataClient } = require('@google-analytics/data');
    const fs = require('fs');
    
    // Decode base64 credentials
    const credsJson = Buffer.from(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 
      'base64'
    ).toString('utf8');
    const creds = JSON.parse(credsJson);
    
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials: creds });
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
    
    const response = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      dimensions: [{ name: 'pagePath' }, { name: 'deviceCategory' }]
    });
    
    // Process response and format for admin panel
    return formatGAResponse(response);
  } catch (error) {
    console.error('GA4 error:', error);
    return getWebsiteStats(); // Fallback to mock
  }
}
```

### Option 2: Plausible Analytics

**1. Add env vars:**
```
PLAUSIBLE_API_KEY=your_api_key
PLAUSIBLE_SITE_ID=fiifit.online
```

**2. Update getWebsiteStats():**

```javascript
async function getWebsiteStats() {
  try {
    const siteId = process.env.PLAUSIBLE_SITE_ID;
    const apiKey = process.env.PLAUSIBLE_API_KEY;
    
    const response = await fetch(
      `https://plausible.io/api/v1/stats/breakdown?site_id=${siteId}&period=30d&property=event:page`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const data = await response.json();
    
    return formatPlausibleResponse(data);
  } catch (error) {
    console.error('Plausible error:', error);
    return getWebsiteStats(); // Fallback
  }
}
```

### Option 3: Custom Supabase Tracking

**1. Create table:**
```sql
create table page_views (
  id bigint primary key generated always as identity,
  page_path text,
  session_id text,
  device_type text,
  referrer text,
  created_at timestamptz default now()
);

create index idx_views_path on page_views(page_path);
```

**2. Add tracking to App.js:**
```javascript
useEffect(() => {
  const sessionId = sessionStorage.getItem('sid') || crypto.randomUUID();
  sessionStorage.setItem('sid', sessionId);
  
  navigator.sendBeacon('/api/track-page', JSON.stringify({
    path: location.pathname,
    session_id: sessionId,
    referrer: document.referrer,
    device: getMobileOS() // Add device detection
  }));
}, [location.pathname]);
```

**3. Update api/admin.js:**
```javascript
async function getWebsiteStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
  const { data } = await supabase
    .from('page_views')
    .select('*')
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  return aggregatePageViews(data);
}
```

## Testing Locally

1. `npm start` - Dev server runs
2. Open http://localhost:3000
3. Navigate to `/admin`
4. Check browser console for any errors
5. Website Views section shows mock data by default

## Deployment

After updating api/admin.js with real analytics:

1. Add env variables to Vercel project settings
2. Commit changes
3. Push to main branch
4. Vercel auto-deploys
5. Verify at yoursite.vercel.app/admin

## Fallback Strategy

All analytics integrations include error handling:
- If API call fails, falls back to mock data
- Error logged to console (visible in Vercel logs)
- Admin panel remains functional

## Debugging

**Check Vercel logs:**
```bash
vercel logs --follow
```

**Test locally:**
```bash
# Set env vars in .env.local
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
npm start
# Visit /admin
# Check console for errors
```

## Performance

- GA4/Plausible calls cached for 5 minutes
- Add caching layer if needed:
```javascript
const CACHE_TIME = 5 * 60 * 1000;
let cachedStats = null;
let lastFetch = 0;

async function getWebsiteStats() {
  if (Date.now() - lastFetch < CACHE_TIME && cachedStats) {
    return cachedStats;
  }
  cachedStats = await fetchFromAnalytics();
  lastFetch = Date.now();
  return cachedStats;
}
```

---

Ready to go live! Pick your analytics provider and follow the setup steps above.
