# 🎨 Visual Guide - Column Images

## 📍 Lokasi Feature

```
Main Table → Flex Table Button → Flex Table Modal → Images Column
```

## 🖼️ Display States

### State 1: No Images
```
┌─────────────────────────────┐
│  No images  [✏️]           │
└─────────────────────────────┘
```
- Shows "No images" text
- `[✏️]` pencil button untuk add (Edit Mode only)

### State 2: With Images (1 image) - View Mode
```
┌─────────────────────────────┐
│  [IMG] 1 📷                │
└─────────────────────────────┘
```
- `[IMG]` = Thumbnail preview (32x32px)
- `1` = Image count
- `📷` = Images icon
- Click anywhere to open lightbox

### State 3: With Images - Edit Mode (pencil appears)
```
┌─────────────────────────────┐
│  [IMG] 1 📷  ✏️            │
└─────────────────────────────┘
        ↑_______↑
        │       └─ Pencil badge (top-right corner)
        └───────── Click to view lightbox
```
- Pencil icon appears on top-right corner of preview
- Click preview = View lightbox
- Click pencil = Manage images

## 🔄 User Flow

### View Images Flow
```
Click Image Preview
       ↓
Lightbox Opens
       ↓
┌─────────────────────────────┐
│  ← Image 1/3 →             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    [FULL IMAGE]       │  │
│  │                       │  │
│  └───────────────────────┘  │
│  Caption: Product View 1    │
│  ┌──┐ ┌──┐ ┌──┐           │
│  │▓▓│ │  │ │  │ ← Thumbs │
│  └──┘ └──┘ └──┘           │
└─────────────────────────────┘
```

**Controls:**
- `←` `→` arrows: Navigate
- `Scroll`: Zoom (max 3x)
- `Click thumbnails`: Jump to image
- `ESC`: Close

### Add Images Flow (Edit Mode)
```
Hover on image preview (Edit Mode)
       ↓
Pencil icon appears on corner ✏️
       ↓
Click pencil icon
       ↓
Image Dialog Opens
       ↓
┌─────────────────────────────────┐
│ Manage Images - ABC123          │
├─────────────────────────────────┤
│ Current Images (2)              │
│ ┌───┐ ┌───┐                   │
│ │IMG│ │IMG│                   │
│ │ 1 │ │ 2 │                   │
│ │[🗑️]│ │[🗑️]│                   │
│ └───┘ └───┘                   │
├─────────────────────────────────┤
│ Add New Image                   │
│ Image URL: [_______________]    │
│ Caption:   [_______________]    │
│             [Cancel] [Add Image]│
└─────────────────────────────────┘
```

**Steps:**
1. Hover pada image preview (Edit Mode)
2. Pencil icon muncul di top-right corner
3. Click pencil icon (bukan image preview)
4. Enter image URL (required)
5. Enter caption (optional)
6. Click **Add Image**
7. Image appears in grid instantly

**Important**: 
- Click preview = View lightbox
- Click pencil = Manage images

### Delete Images Flow (Edit Mode)
```
In Image Dialog
       ↓
Click [🗑️] on image
       ↓
Confirmation Dialog
       ↓
┌─────────────────────────────────┐
│ ⚠️  Delete Confirmation         │
│                                 │
│ Are you sure you want to        │
│ delete this image?              │
│                                 │
│         [Cancel] [Delete]       │
└─────────────────────────────────┘
       ↓
Image Removed
```

## 🎯 Click Zones

### Table Cell Click Zones
```
┌─────────────────────────────────┐
│  ┌────────────────┐  ✏️         │
│  │   LIGHTBOX     │             │
│  │   ZONE         │   EDIT      │
│  │   (Click to    │   ZONE      │
│  │    view)       │  (Edit Mode)│
│  └────────────────┘             │
└─────────────────────────────────┘
```

- **Preview area**: Opens lightbox (always)
- **Pencil badge** (top-right corner): Opens image management (Edit Mode only)
- **Clear separation**: Pencil positioned outside preview untuk avoid conflicts

### Image Dialog Click Zones
```
┌─────────────────────────────────┐
│ ┌────────────────┐              │
│ │  VIEW ZONE     │ [🗑️] DELETE  │
│ │  (Opens        │              │
│ │   Lightbox)    │              │
│ └────────────────┘              │
└─────────────────────────────────┘
```

## 📊 Data Structure Visual

```javascript
Row Object
├── id: "1000"
├── code: "ABC123"
├── location: "Store A"
└── images: [
      ├── {
      │   url: "https://...",
      │   caption: "View 1",
      │   description: ""
      │   }
      ├── {
      │   url: "https://...",
      │   caption: "View 2",
      │   description: ""
      │   }
      └── ...
    ]
```

## 🎨 Style Guide

### Colors
```
┌─────────────────────────────────┐
│ Preview Background: #e3f2fd     │  (Light Blue 50)
│ Preview Border:     #90caf9     │  (Light Blue 200)
│ Preview Hover:      #bbdefb     │  (Light Blue 100)
│ Text Color:         #1976d2     │  (Blue 700)
│ Icon Color:         #1976d2     │  (Blue 700)
└─────────────────────────────────┘
```

### Sizes
```
┌─────────────────────────────────┐
│ Thumbnail:          32x32px     │
│ Grid Image:         120x120px   │
│ Dialog Width:       600px       │
│ Lightbox Thumbnail: 120x80px    │
└─────────────────────────────────┘
```

### Spacing
```
┌─────────────────────────────────┐
│ Cell Gap:           0.5rem      │
│ Grid Gap:           1rem        │
│ Dialog Gap:         1.5rem      │
│ Lightbox Gap:       16px        │
└─────────────────────────────────┘
```

## 🔐 Edit Mode Protection

```
┌─────────────────────────────────┐
│        Feature          Status  │
├─────────────────────────────────┤
│ View Images           ✅ Always │
│ Open Lightbox         ✅ Always │
│ Add Button            🔒 Edit   │
│ Edit Button           🔒 Edit   │
│ Delete Button         🔒 Edit   │
│ Add Form              🔒 Edit   │
└─────────────────────────────────┘
```

## 📱 Responsive Behavior

### Desktop (> 768px)
```
┌─────────────────────────────────┐
│  [IMG] 3 📷  [✏️]              │
│  (Full width, all elements)     │
└─────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌───────────────────────────┐
│  [IMG] 3 📷  [✏️]        │
│  (Compact spacing)        │
└───────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────┐
│  [I] 3 📷  [✏️]    │
│  (Icons only)       │
└─────────────────────┘
```

## 🎯 Common Scenarios

### Scenario 1: Add First Image
```
1. Enable Edit Mode
2. See [+] button
3. Click [+]
4. Enter URL
5. Add caption
6. Submit
7. See thumbnail immediately
```

### Scenario 2: View Gallery
```
1. See thumbnail with count
2. Click thumbnail
3. Lightbox opens
4. Use ← → to navigate
5. Scroll to zoom
6. Click thumbnails to jump
7. ESC to close
```

### Scenario 3: Delete Image
```
1. Enable Edit Mode
2. Click [✏️] on row
3. See all images in grid
4. Click [🗑️] on unwanted image
5. Confirm deletion
6. Image removed instantly
```

## 💡 Tips

### Best Practices
```
✅ DO:
  - Use HTTPS URLs
  - Add descriptive captions
  - Use CDN URLs for speed
  - Keep captions short
  - Test zoom on all images

❌ DON'T:
  - Use Google Drive links
  - Use expired URLs
  - Add very large images
  - Forget to add captions
  - Add too many images (performance)
```

### Recommended URLs
```
🎯 Unsplash:    https://images.unsplash.com/...
🎯 Imgur:       https://i.imgur.com/...
🎯 Cloudinary:  https://res.cloudinary.com/...
```

---

**Ready to use! Click around and explore! 🚀**
