# Admin Panel - Website Views Analytics

## Overview

The Admin Panel now includes a comprehensive **Website Views** section that displays analytics data about website traffic, user behavior, and device distribution.

## Features Added

### 1. **Website Stats Dashboard**
Four key metrics at a glance:
- **Total Views**: Total number of page views across the website
- **Unique Visitors**: Number of distinct user sessions
- **Bounce Rate**: Percentage of visitors who leave without further interaction
- **Average Session Duration**: Average time users spend on the site (in minutes)

### 2. **Top Pages Card**
Displays the most visited pages with:
- Page title and path
- View count
- Percentage of total views
- Visual comparison

Pages tracked include:
- Homepage (`/`)
- Pricing page (`/pricing`)
- Macro Tracker (`/tracker`)
- Account page (`/account`)
- Lessons (`/lessons`)

### 3. **Top Referrers Card**
Shows traffic sources with:
- Source name (Direct, Google, Facebook, Instagram, Telegram, etc.)
- Number of visits
- Percentage of total traffic
- Domain information

### 4. **Device Statistics**
Breaks down user access by device type:
- Mobile (66.5%)
- Desktop (28.2%)
- Tablet (5.3%)
- Visual progress bars for each category

## Component Structure

### Frontend Files

**`src/components/Admin.js`**
- Updated Admin component with conditional rendering for website section
- New JSX elements for displaying website analytics
- Data fetching from `/api/admin` endpoint

**`src/components/Admin.css`**
- New CSS classes for website views styling:
  - `.admin-website-section`: Main container
  - `.admin-website-grid`: 4-column stats grid
  - `.admin-website-card`: Individual stat cards
  - `.admin-website-grid-pages`: 2-column layout for detailed cards
  - `.admin-pages-card`: Container for pages and referrers lists
  - `.admin-page-item`: Individual page/referrer entry
  - `.admin-device-card`: Device statistics container
  - Responsive breakpoints for mobile, tablet, and desktop

### Backend Files

**`api/admin.js`**
- New function `getWebsiteStats()` - Returns mock website analytics data
- Enhanced `calculateAnalytics()` - Now includes web traffic data
- Updated `handleDashboard()` - Includes website stats in API response

## Mock Data Structure

The website stats currently use mock data. The structure is:

```javascript
{
  totalViews: 12847,
  uniqueVisitors: 3254,
  bounceRate: 34.2,
  avgSessionDuration: 4.5,
  topPages: [
    {
      path: '/',
      title: 'Homepage',
      views: 3847,
      percentage: 29.9
    },
    // ... more pages
  ],
  topReferrers: [
    {
      source: 'Direct',
      domain: 'fiifit.online',
      count: 5234,
      percentage: 40.7
    },
    // ... more referrers
  ],
  deviceStats: [
    {
      type: 'Mobile',
      count: 8547,
      percentage: 66.5
    },
    // ... more devices
  ]
}
```

## Integration with Analytics Providers

The `getWebsiteStats()` function in `api/admin.js` is ready for integration with popular analytics platforms:

### Google Analytics Integration
```javascript
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

async function getWebsiteStats() {
  const analyticsClient = new BetaAnalyticsDataClient();
  const response = await analyticsClient.runReport({
    property: 'properties/YOUR_GA4_PROPERTY_ID',
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' }
    ]
  });
  // Process and return formatted data
}
```

### Plausible Analytics Integration
```javascript
async function getWebsiteStats() {
  const response = await fetch('https://plausible.io/api/v1/stats/breakdown', {
    headers: { 'Authorization': `Bearer ${process.env.PLAUSIBLE_API_KEY}` },
    body: JSON.stringify({
      site_id: process.env.PLAUSIBLE_SITE_ID,
      period: 'custom',
      date: 'last_30d'
    })
  });
  const data = await response.json();
  // Process and return formatted data
}
```

### Custom Tracking Integration
```javascript
async function getWebsiteStats() {
  // Query from your Supabase analytics table
  const { data } = await supabase
    .from('page_views')
    .select('*')
    .gte('created_at', thirtyDaysAgo);
  
  // Aggregate and return formatted data
}
```

## Styling & Responsive Design

The website views section is fully responsive:

- **Desktop (>1200px)**: 4-column stats grid, 2-column detail cards
- **Tablet (980px-1200px)**: 2-column stats grid, 1-column detail cards
- **Mobile (<620px)**: Single-column layout for all sections

Color scheme uses the same design system as the rest of the admin panel:
- Primary color: `var(--primary)` (teal/green)
- Background: Dark theme with gradient overlays
- Borders: Semi-transparent white
- Text: White with various opacity levels

## How to Use

### For Admins
1. Navigate to `/admin` (requires admin email in `ADMIN_EMAILS` environment variable)
2. Scroll down to the "Website Views" section
3. View real-time analytics for:
   - Overall site performance metrics
   - Which pages drive the most engagement
   - Top traffic sources
   - Device type distribution

### For Developers

**To update with real data from Google Analytics:**

1. Set up Google Analytics 4 with Measurement ID
2. Install the Google Analytics library:
   ```bash
   npm install @google-analytics/data
   ```
3. Add environment variables:
   ```
   GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
   ```
4. Update `getWebsiteStats()` in `api/admin.js` to fetch from GA4

**To update with real data from Plausible:**

1. Create a Plausible account and add your site
2. Install Plausible on your website
3. Add environment variables:
   ```
   PLAUSIBLE_API_KEY=your_api_key
   PLAUSIBLE_SITE_ID=your_site_id
   ```
4. Update `getWebsiteStats()` to fetch from Plausible API

**To create a custom analytics table in Supabase:**

```sql
create table if not exists page_views (
  id bigint primary key generated always as identity,
  page_path text not null,
  session_id text not null,
  device_type text,
  referrer text,
  user_agent text,
  created_at timestamptz default now()
);

create index idx_page_views_session on page_views(session_id);
create index idx_page_views_path on page_views(page_path);
```

Then update the frontend to track page views:
```javascript
// In your main App.js or router
useEffect(() => {
  const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
  localStorage.setItem('session_id', sessionId);
  
  fetch('/api/track-page-view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page_path: window.location.pathname,
      session_id: sessionId,
      referrer: document.referrer
    })
  });
}, [window.location.pathname]);
```

## Environment Variables

No new environment variables are required for the mock data version. To connect to real analytics platforms, add:

```
# Google Analytics
GOOGLE_ANALYTICS_PROPERTY_ID=your_ga4_property_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Plausible Analytics
PLAUSIBLE_API_KEY=your_api_key
PLAUSIBLE_SITE_ID=your_site_id

# Custom Tracking (Supabase)
# Uses existing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

## API Response Format

The `/api/admin` endpoint now returns a `website` object:

```json
{
  "admin": { ... },
  "stats": { ... },
  "users": [ ... ],
  "telegram": { ... },
  "analytics": { ... },
  "website": {
    "totalViews": 12847,
    "uniqueVisitors": 3254,
    "bounceRate": 34.2,
    "avgSessionDuration": 4.5,
    "topPages": [ ... ],
    "topReferrers": [ ... ],
    "deviceStats": [ ... ]
  },
  "config": { ... }
}
```

## Accessibility

- All metrics have descriptive labels and proper heading hierarchy
- Color contrasts meet WCAG AA standards
- Stats are displayed as both visual elements and numbers
- No critical information is conveyed by color alone

## Performance Considerations

The website stats are fetched alongside user and Telegram stats using `Promise.all()`, so there's no additional API call latency. When integrating with external analytics providers:

1. Cache results for 1-5 minutes to avoid rate limiting
2. Consider using a background job to pre-compute stats
3. Add error handling to gracefully degrade if analytics API is unavailable

## Future Enhancements

- Date range selection for historical analysis
- Export analytics to CSV/PDF
- Custom event tracking (form submissions, button clicks, etc.)
- Conversion funnel tracking
- Geographic data visualization
- A/B testing integration
- Real-time analytics dashboard
- Alerts for traffic anomalies

## Support

For issues or questions about the website views feature, refer to:
- Google Analytics documentation: https://developers.google.com/analytics/devguides/reporting/data/v1
- Plausible API documentation: https://plausible.io/docs/stats-api
- Admin panel README in this repository
