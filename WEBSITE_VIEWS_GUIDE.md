# Website Views Admin Section - Visual Guide

## Section Layout

The Website Views section appears at the bottom of the Admin Dashboard (`/admin` page), after the User Management section.

### Section Header
```
┌─────────────────────────────────┐
│ ANALYTICS                       │
│ Website Views                   │
└─────────────────────────────────┘
```

## Layout Breakdown

### 1. Top Metrics (4-Column Grid)

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Total Views      │ Vizitatori Unici │ Rata de Bounce   │ Timp Mediu       │
│                  │                  │                  │                  │
│     12,847       │       3,254      │      34.2%       │      4.5 min     │
│                  │                  │                  │                  │
│ pagini           │ sesiuni          │ vizitatori       │ minute in        │
│ vizualizate      │ diferite         │ care au iesit    │ medie            │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

### 2. Detailed Analytics (2-Column Layout)

#### Left Column: Popular Pages
```
┌─────────────────────────────────────┐
│ PAGINI POPULARE                     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Homepage                        │ │
│ │ /                       3847 | 29.9% │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Pricing                         │ │
│ │ /pricing                2156 | 16.8% │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Macro Tracker                   │ │
│ │ /tracker                1934 | 15.1% │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Account                         │ │
│ │ /account                1247 | 9.7% │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Lessons                         │ │
│ │ /lessons                 856 | 6.7% │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Right Column: Top Referrers
```
┌─────────────────────────────────────┐
│ REFERRER-URI TOP                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Direct                          │ │
│ │ fiifit.online          5234 | 40.7% │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Google                          │ │
│ │ google.com             2847 | 22.1% │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Facebook                        │ │
│ │ facebook.com           1956 | 15.2% │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Instagram                       │ │
│ │ instagram.com          1324 | 10.3% │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Telegram                        │ │
│ │ telegram.org            486 | 3.8% │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 3. Device Statistics (Full Width)

```
┌───────────────────────────────────────────────────────┐
│ DISPOZITIVE                                           │
│                                                       │
│ Mobile                                                │
│ 8547 utilizatori                                      │
│ ████████████████████████████████ 66.5%               │
│                                                       │
│ Desktop                                               │
│ 3624 utilizatori                                      │
│ ████████████ 28.2%                                   │
│                                                       │
│ Tablet                                                │
│ 676 utilizatori                                       │
│ ██ 5.3%                                              │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Color Scheme

### Colors Used
- **Primary Accent**: Teal/Green (`#00d084` / `var(--primary)`)
  - Labels
  - Percentages
  - Progress bar fills
  
- **Text Colors**:
  - Headings: White (100% opacity)
  - Labels: Gray (54% opacity)
  - Secondary info: Gray (42-48% opacity)
  
- **Backgrounds**:
  - Cards: Semi-transparent white (3.5% opacity on dark background)
  - Borders: Semi-transparent white (9% opacity)
  
- **Accent Gradient**: Teal to Light Teal
  - Used in progress bars: `linear-gradient(90deg, var(--primary), #72ffd1)`

## Responsive Behavior

### Desktop (>1200px)
- 4-column metrics grid
- 2-column detail cards (Pages & Referrers side by side)
- Full-width device stats

### Tablet (980px - 1200px)
- 2-column metrics grid
- 1-column detail cards (Pages above Referrers)
- Full-width device stats

### Mobile (<620px)
- 1-column metrics grid
- 1-column detail cards
- 1-column device stats
- Buttons and stats stack vertically

## Data Types

### Metrics Card
- **Label**: Small caps text in primary color
- **Value**: Large bold number (32-38px)
- **Description**: Small gray text

Example:
```
TOTAL VIEWS        ← label
12,847             ← value
pagini vizualizate ← description
```

### Page/Referrer Item
- **Title/Name**: Bold (page title or referrer source)
- **Path/Domain**: Small gray text
- **Views/Count**: Gray text with count
- **Percentage**: Primary color, bold, right-aligned

Example:
```
Homepage                           ← title
/                   3847 | 29.9%   ← path + views + percentage
```

### Device Item
- **Type**: Bold text (Mobile, Desktop, Tablet)
- **Count**: Small gray text (number of users)
- **Progress Bar**: Gradient fill with percentage
- **Percentage**: Primary color, right-aligned

Example:
```
Mobile
8547 utilizatori
████████████████████████████████ 66.5%
```

## Interactive Elements

### Cards
- Subtle hover effects (slight opacity increase)
- Border color transitions
- No click actions (read-only display)

### Lists
- Each item is a separate card with border
- Proper spacing between items
- Responsive alignment on mobile

## Empty States

When no data is available:
```
┌─────────────────────────────────┐
│ PAGINI POPULARE                 │
│                                 │
│ Nu exista date de pagini inca.  │
│                                 │
└─────────────────────────────────┘
```

## CSS Classes Reference

| Class | Purpose | Element Type |
|-------|---------|--------------|
| `.admin-website-section` | Main container | Section |
| `.admin-website-grid` | 4-column metrics grid | Div |
| `.admin-website-card` | Individual metric card | Article |
| `.admin-website-grid-pages` | 2-column detail cards | Div |
| `.admin-pages-card` | Pages or referrers card | Article |
| `.admin-page-item` | Single page/referrer entry | Div |
| `.admin-device-card` | Device stats container | Article |
| `.admin-device-list` | Grid of device items | Div |
| `.admin-device-item` | Single device entry | Div |
| `.admin-device-bar-track` | Progress bar background | Div |
| `.admin-page-stats` | Stats section of page/referrer | Div |
| `.admin-page-percentage` | Percentage display | Span |

## Accessibility Features

✓ **Semantic HTML**
- Proper heading hierarchy
- `<article>` for cards
- `<section>` for groups
- `<span>` for labels

✓ **Visual Hierarchy**
- Size and color differences
- Clear labels and descriptions
- Proper contrast ratios

✓ **Color Independence**
- Information conveyed by size, not color alone
- Percentage numbers accompany visual bars

✓ **Responsive Text**
- Font sizes scale with viewport
- Line-height for readability
- Proper padding/spacing

## Typography

| Element | Font Size | Font Weight | Usage |
|---------|-----------|-------------|-------|
| Section Label | 12px | 900 | "ANALYTICS" |
| Section Title | 34px | 700 | "Website Views" |
| Metric Value | 36px | 700 | "12,847" |
| Card Label | 12px | 900 | "Total Views" |
| Item Title | 14px | 600 | "Homepage" |
| Small Text | 12px | 400 | Descriptions |

## Animation

Currently: Static display
Potential additions:
- Fade-in on load
- Smooth counter animations for numbers
- Hover state transitions
- Loading skeleton screens

## Keyboard Navigation

- Tab through section
- Focus visible on card borders
- No interactive elements requiring keyboard shortcuts

## Browser Support

✓ Chrome/Edge (Latest)
✓ Firefox (Latest)
✓ Safari (Latest)
✓ Mobile browsers (iOS Safari, Chrome Mobile)

Requirements:
- CSS Grid support
- CSS Flexbox support
- CSS Custom Properties (--primary)
- ES6 JavaScript features

---

**Last Updated:** 2026-06-10
**Version:** 1.0
