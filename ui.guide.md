# 사잇길 UI Design Guide

Design system extracted from the existing UI. Use this as the single source of truth for all visual decisions.

---

## Color Tokens

### Neutral Scale

| Token | Value | Usage |
|---|---|---|
| `ink-100` | `#111` | Primary text, dark CTA background |
| `ink-80` | `#333` | Medium-dark text |
| `ink-60` | `#444` | Secondary text (route steps) |
| `ink-40` | `#666` | Muted labels |
| `ink-30` | `#888` | Back buttons, icon buttons, placeholders |
| `ink-20` | `#aaa` | Tertiary labels, meta info |
| `ink-10` | `#bbb` | Clear button (×), placeholder text |
| `ink-05` | `#ccc` | Divider arrows, inactive description text |

| Token | Value | Usage |
|---|---|---|
| `surface-0` | `#fff` | App background, card background |
| `surface-1` | `#fafafa` | Name input background |
| `surface-2` | `#f5f5f5` | Body background, dropdown highlight row |
| `surface-3` | `#f0f0f0` | Dividers, inactive top bar, transfer badge bg |
| `surface-4` | `#ebebeb` | Default card border |
| `surface-5` | `#e8e8e8` | Incomplete card border, line badge (on highlight) |
| `surface-6` | `#e0e0e0` | Input border (rest), disabled button, small button border |
| `surface-7` | `#d0d0d0` | Dashed "add" button border |

### Semantic Colors

| Token | Value | Usage |
|---|---|---|
| `accent` | `#F97316` | Primary accent — "start!" badge, input focus border, card done border, CTA enabled, completion label |
| `accentMuted` | `#FFF3E8` | Accent surface — light tint for accent highlights |
| `bgPage` | `#F2F2F2` | Page/app background (body + app shell) |
| `success` | `#22C55E` | Success indicators only |
| `warning-bg` | `#fff8f0` | Error/warning box background |
| `warning-border` | `#ffd8a8` | Error/warning box border |
| `warning-text` | `#c47f00` | Error/warning box text |
| `spinner-blue` | `#4F46E5` | Loading spinner (full-page) |

### Category Colors

| Category | Value |
|---|---|
| 카페 | `#6F4E37` |
| 맛집 | `#D94F3D` |
| 술집 | `#4A3C8C` |

Dynamic opacity variants are applied using hex suffixes:
- `06` ≈ 2% — card tint background (selected/top card)
- `10` ≈ 6% — sort button active background
- `14` ≈ 8% — category/recommend badge background
- `18` ≈ 9% — arrival line badge background, card selected shadow
- `28` ≈ 16% — card hover shadow
- `35` ≈ 21% — card prominent hover shadow
- `50` ≈ 31% — top card border (non-selected), route button border

---

## Typography

### Font Stack
```
-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif
```
Applied globally to `body`, `button`, and `input`.

### Font Size Scale

| Step | px | Usage |
|---|---|---|
| `text-2xl` | 28px | Intro hero heading |
| `text-xl` | 22px | Screen h1 (OriginScreen, ResultScreen) |
| `text-lg` | 20px | Screen h1 (PlaceScreen) |
| `text-md` | 18px | Station name in candidate card |
| `text-base` | 16px | Primary CTA label, icon button |
| `text-sm` | 15px | Station input, CTA label (forward/back) |
| `text-body` | 14px | Body text, name input, autocomplete station name |
| `text-caption` | 13px | Screen subtitle (meta), travel time per person |
| `text-xs` | 12px | Sub-category, address, description, sort label |
| `text-xxs` | 11px | Badges, labels, route row labels, completion status |
| `text-micro` | 10px | Score label, category badge, section header, arrival badge |

### Font Weights

| Value | Usage |
|---|---|
| 700 | Headings, active tab, place name, rank badge, "추천" badge |
| 600 | Selected state text, CTA buttons, station name (focused), arrival badge, route endpoint |
| 500 | Line badge, secondary button, autocomplete badge |
| 400 | Body text, inactive tab, regular autocomplete item |

### Letter Spacing

| Value | Usage |
|---|---|
| `-0.6px` | 28px hero heading |
| `-0.5px` | Score number |
| `-0.4px` | Screen h1 (22px) |
| `-0.3px` | App title (lettermark) |
| `-0.2px` | Station name (18px), place name (14px) |
| `0.1px` | Screen subtitle |
| `0.4px` | "추천" badge |
| `0.8px` | "예상 경로" uppercase section header |
| `1.5px` | Intro lettermark |

### Line Height

| Value | Usage |
|---|---|
| `1.2` | Intro hero heading |
| `1.3` | Screen headings |
| `1.5` | Description text |
| `1.6` | Card description (faded) |
| `1` | Badges, compact elements |

---

## Spacing Scale

All layout spacing follows an 8pt base grid.

| Token | px | Usage |
|---|---|---|
| `space-1` | 2px | Hairline micro spacing |
| `space-2` | 4px | Icon row gap |
| `space-3` | 6px | Add-button icon gap, small button gap |
| `space-4` | 8px | Input field gap, autocomplete separator |
| `space-5` | 10px | Sort button padding h, card list top padding |
| `space-6` | 12px | Card gap, add-button padding, footer padding v |
| `space-7` | 14px | Input padding h, card compact padding h |
| `space-8` | 16px | Standard card padding, screen section gap |
| `space-9` | 18px | PlaceScreen header mb |
| `space-10` | 20px | Map section gap |
| `space-12` | 28px | Back button mb, heading section mb (ResultScreen) |
| `space-14` | 32px | Heading section mb (OriginScreen) |

### Responsive Container Padding (clamp)

| Axis | Value |
|---|---|
| Vertical top | `clamp(28px, 6vw, 48px)` |
| Horizontal | `clamp(16px, 5vw, 28px)` |
| Bottom (for fixed footer) | `90px – 100px` |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius.sm` | 6px | Small badges, line name badge, recommend badge |
| `radius.md` | 10px | Place cards, secondary CTA, map container, sort pill buttons |
| `radius.lg` | 14px | Origin cards, candidate cards, inputs, primary CTA, dropdowns, KakaoMap |
| `radius.full` | 50% | Circular elements only — rank circles, map markers |

---

## Shadows / Elevation

| Level | Value | Usage |
|---|---|---|
| 0 | `none` | Default state |
| 1 | `0 1px 3px rgba(0,0,0,0.04)` | Place card (rest) |
| 2 | `0 1px 4px rgba(0,0,0,0.05)` | Candidate card (rest) |
| 3 | `0 2px 12px ${color}18` | Place card (selected) |
| 4 | `0 4px 14px rgba(0,0,0,0.08)` | Card hover (unselected) |
| 5 | `0 4px 16px rgba(0,0,0,0.08)` | Autocomplete dropdown |
| 6 | `0 4px 20px ${color}28` | Candidate card (selected) |
| 7 | `0 6px 20px ${color}28` | Place card hover (selected) |
| 8 | `0 6px 20px rgba(0,0,0,0.09)` | Candidate card hover (unselected) |
| 9 | `0 8px 28px ${color}35` | Candidate card hover (selected) |

Map markers: `0 2px 8px rgba(0,0,0,0.28)` — `0 2px 10px rgba(0,0,0,0.35)`

---

## Buttons

### Primary CTA (orange accent, full-width)
Used as the main page-advancing action in the fixed footer.

```
background:    #F97316 / color.accent (enabled) | #e0e0e0 (disabled)
color:         #fff (enabled) | #aaa (disabled)
height:        56px
border-radius: 14px / radius.lg
border:        none
font-size:     16px
font-weight:   600
cursor:        pointer (enabled) | not-allowed (disabled)
transition:    background 0.15s
whileTap:      scale 0.98
```

### Forward CTA (dark, full-width)
Used to navigate forward to the next screen (ResultScreen → PlaceScreen).

```
background:    #111
color:         #fff
padding:       15px
border-radius: 16px
border:        none
font-size:     15px
font-weight:   600
cursor:        pointer
display:       flex, center, gap 6px
whileTap:      scale 0.98
```

### Secondary CTA (outline, full-width)
Used for secondary/back actions.

```
background:    #fff
color:         #333
border:        1px solid #e0e0e0
padding:       15px
border-radius: 12px
font-size:     15px
font-weight:   500
cursor:        pointer
whileTap:      scale 0.98
```

### Small Action Button
Used for 공유, 지도보기, 길찾기.

```
padding:       5px 10px
border-radius: 6px
border:        1px solid #e0e0e0 (neutral) | 1px solid ${color}50 (accent)
background:    #fff
font-size:     11px
color:         #666 (neutral) | ${accentColor} (accent)
font-weight:   500 (neutral) | 600 (accent)
whileTap:      scale 0.95
transition:    duration 0.1s
```

### Add Origin Button (borderless)
```
border:        none
border-radius: 14px / radius.lg
padding:       12px
background:    none
font-size:     14px
color:         #888
gap:           6px
whileTap:      scale 0.98
```

### Back / Ghost Button
```
border:        none
background:    none
padding:       0
font-size:     14px
color:         #888
gap:           4px
whileTap:      scale 0.97
```

### Tab Button
```
padding:       13px 0
flex:          1
border:        none
background:    none
font-size:     14px
font-weight:   700 (active) | 400 (inactive)
color:         ${categoryColor} (active) | #aaa (inactive)
border-bottom: 2.5px solid ${color} (active) | 2.5px solid transparent (inactive)
margin-bottom: -1px (aligns with container border)
transition:    all 0.15s
```

### Sort Pill Button
```
padding:       4px 10px
border-radius: 20px
border:        1px solid ${color} (active) | 1px solid #e8e8e8 (inactive)
background:    ${color}10 (active) | #fff (inactive)
font-size:     12px
color:         ${color} (active) | #999 (inactive)
font-weight:   600 (active) | 400 (inactive)
transition:    all 0.15s
```

---

## Inputs

### Name Input (standalone)
```
padding:       10px 14px
border-radius: 14px / radius.lg
border:        1px solid #F97316 / color.accent (focused) | 1px solid #e0e0e0 (rest)
background:    #fff
font-size:     14px
color:         #111
outline:       none
box-shadow:    none
transition:    border-color 0.18s
```

### Station Input (composite)
Wrapper div + inner input + clear button.

**Wrapper:**
```
display:       flex, align-items: center
border:        1px solid #F97316 / color.accent (focused) | 1px solid #e0e0e0 (rest)
border-radius: 14px / radius.lg
padding:       12px 14px
background:    #fff
transition:    border-color 0.18s
box-shadow:    none
```

**Inner input:**
```
border:        none
outline:       none
font-size:     15px
flex:          1
background:    transparent
color:         #111
```

**Clear button (×):**
```
border:        none
background:    none
padding:       0
color:         #bbb
font-size:     16px
line-height:   1
```

---

## Cards

### Origin Card (OriginScreen)
```
background:    #fff (always)
border-radius: 14px / radius.lg
border:        1.5px solid #F97316 / color.accent (complete) | 1px solid #ebebeb / color.borderSubtle (incomplete)
padding:       16px
box-shadow:    none
transition:    border-color 0.2s
```
Completion state in card header (top-right):
- When done: orange text "✓ 입력 완료" (`font-size: 11px`, `color: color.accent`, `font-weight: 600`)
- Remove button (−) shown only when `origins.length > 2`

### Candidate Station Card (ResultScreen)
```
border-radius: 16px
border:        1.5px solid ${lineColor} (selected) | 1.5px solid ${lineColor}60 (top, unselected) | 1.5px solid #ebebeb (rest)
background:    ${lineColor}06 (top rank) | #fff (others)
margin-bottom: 12px
box-shadow:    0 4px 20px ${lineColor}28 (selected) | 0 1px 4px rgba(0,0,0,0.05) (rest)
overflow:      hidden
transition:    box-shadow 0.2s, border-color 0.2s
```
Top accent bar: `height: 4px`, `background: ${lineColor} (selected) | ${lineColor}50 (top) | #f0f0f0 (rest)`

Inner padding: `16px 16px 18px`

### Place Card (PlaceScreen)
```
border-radius: 12px
border:        1.5px solid ${accentColor} (selected) | 1.5px solid #ebebeb (rest)
background:    ${accentColor}06 (selected) | #fff (rest)
margin-bottom: 8px
box-shadow:    0 2px 12px ${accentColor}18 (selected) | 0 1px 3px rgba(0,0,0,0.04) (rest)
transition:    background 0.2s, box-shadow 0.2s, border-color 0.2s
```
Inner padding: `12px 14px`

### Autocomplete Dropdown
```
position:      absolute, top: 100%, left/right: 0
background:    #fff
border:        1px solid #e0e0e0
border-radius: 8px
margin-top:    4px
box-shadow:    0 4px 16px rgba(0,0,0,0.08)
z-index:       100
overflow:      hidden
```
Row: `padding: 11px 14px`, `border-bottom: 1px solid #f5f5f5`
Row (highlighted): `background: #f5f5f5`

---

## Badges

### Line Name Badge
```
background:    ${lineColor}
color:         #fff
padding:       2px 7px
border-radius: 5px
font-size:     11px
font-weight:   600
```

### Recommend / Category Badge
```
background:    ${color}14
color:         ${color}
padding:       2px 7px
border-radius: 4px
font-size:     10px
font-weight:   700
letter-spacing: 0.4px
```

### Transfer Badge ("환승역")
```
background:    #f0f0f0
color:         #888
padding:       2px 6px
border-radius: 4px
font-size:     10px
font-weight:   500
```

### Rank Circle
```
width/height:  22px
border-radius: 50%
background:    ${lineColor} (selected) | #e0e0e0 (unselected)
color:         #fff (selected) | #888 (unselected)
font-size:     11px
font-weight:   700
display:       flex, center
transition:    background 0.2s, color 0.2s
```

### Arrival Line Mini Badge (RouteRow)
```
background:    ${lineColor}18
color:         ${lineColor}
padding:       1px 5px
border-radius: 4px
font-size:     10px
font-weight:   600
```

---

## Layout

### App Shell
```
max-width:     480px
margin:        0 auto
min-height:    100vh
background:    #F2F2F2 / color.bgPage
position:      relative
overflow:      hidden
```

### Fixed Footer Bar
```
position:      fixed
bottom/left/right: 0
background:    #fff
border-top:    1px solid #f0f0f0
```
Inner wrapper: `max-width: 480px`, `margin: 0 auto`, `padding: 14px clamp(16px, 5vw, 28px)`

### Scrollable Card List
```
flex:          1
overflow-y:    auto
padding:       10px clamp(16px, 5vw, 28px) 90px
```

### Map Container
```
height:        clamp(150px, 36vw, 196px)
border-radius: 12px
overflow:      hidden
margin-bottom: 20px
```

---

## Animations

### Easing
All transitions use `[0.25, 0.1, 0.25, 1]` (cubic-bezier, close to `ease-out`).

### Page Transitions (AnimatePresence)
```js
initial:  { opacity: 0, y: 10 }
animate:  { opacity: 1, y: 0, duration: 0.22 }
exit:     { opacity: 0, y: -6, duration: 0.16 }
```

### Section Heading Entrance
```js
initial:  { opacity: 0, y: 12 }
animate:  { opacity: 1, y: 0, duration: 0.45 }
```

### Card List Entrance
```js
initial:  { opacity: 0, y: 8 }
animate:  { opacity: 1, y: 0, duration: 0.40, delay: 0.08 }
```

### Card Stagger
- Candidate cards: `delay: index * 0.07s`, `duration: 0.35s`
- Place cards: `delay: index * 0.05s`, `duration: 0.28s`
- Entry: `{ opacity: 0, y: 16, scale: 0.98 }` → `{ opacity: 1, y: 0, scale: 1 }`

### Hover / Tap
```
Cards:   whileHover: { y: -2 } (candidate) | { y: -1 } (place)
Buttons: whileTap:   { scale: 0.98 } (primary) | { scale: 0.95 } (small)
Back:    whileTap:   { scale: 0.97 }
```

### Loading Spinner
```
width/height:  16px (inline) | 28px (full-page)
border:        2px solid rgba(255,255,255,0.35) (inline) | 2.5px solid #e8e8e8 (full-page)
border-top:    #fff (inline) | #4F46E5 (full-page)
border-radius: 50%
animation:     spin 0.75s linear infinite
```

---

## Status / Error

### Warning Box
```
background:    #fff8f0
border:        1px solid #ffd8a8
border-radius: 10px
padding:       10px 14px
font-size:     12px
color:         #c47f00
```

### Success Indicator
```
icon circle:   fill #22C55E at 12% opacity
icon stroke:   #22C55E, strokeWidth 1.4
label:         font-size 11px, color #22C55E, font-weight 500
```

---

## Consistency Rules

1. **Primary CTA** (main page action) → `background: color.accent (#F97316)` when enabled, `height: 56px`, `borderRadius: radius.lg (14px)`
2. **Secondary outline CTA** (back/reset) → `borderRadius: radius.md (10px)`, `padding: 15px`, `border: 1px solid #e0e0e0`
3. **Footer inner wrapper** → always `padding: 14px clamp(16px, 5vw, 28px)`
4. **Back button** → `marginBottom: 28`, never hardcoded px without clamp
5. **Input focus** → `border-color: color.accent (#F97316)` — orange, not black
6. **Card border** → always `1.5px solid` (not `1px`) for candidate/place cards; origin cards use `1.5px` when done, `1px` when incomplete
7. **Section headings** → `h1` for screen title, `p` for subtitle; OriginScreen uses "start!" badge above h1
8. **Screen subtitle** → `font-size: 13px`, `color: #888`
9. **Page background** → always `#F2F2F2 / color.bgPage` (body + app shell)
10. **Completion state** → shown in card header top-right as orange "✓ 입력 완료" text, not below input
