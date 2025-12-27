# 🎨 Theme Customization Guide

Easy configuration for your Menopause Care app.

## 📝 Quick Start

All app settings are in one place: **`src/config/site.ts`**

## 🎯 What You Can Change

### 1. App Name & Description
```typescript
name: "Menopause Care",  // Change your app name
description: "Your comprehensive menopause health management platform",
```

### 2. Brand Colors

Colors use OKLCH format for better consistency across themes.

**Generate colors at:** https://oklch.com

```typescript
colors: {
  primary: {
    light: "oklch(0.646 0.222 41.116)",  // Main brand color (light mode)
    dark: "oklch(0.922 0 0)"              // Main brand color (dark mode)
  },
  secondary: {
    light: "oklch(0.97 0 0)",
    dark: "oklch(0.269 0 0)"
  },
}
```

**Popular color schemes:**
- **Medical Blue:** `oklch(0.5 0.15 240)`
- **Calming Teal:** `oklch(0.6 0.12 190)`
- **Professional Purple:** `oklch(0.55 0.18 290)`
- **Warm Orange:** `oklch(0.65 0.22 45)`

### 3. Border Radius
```typescript
radius: "0.625rem",  // 10px - rounded corners
```

**Options:**
- `"0"` - Sharp corners (modern)
- `"0.5rem"` - Slightly rounded
- `"1rem"` - Very rounded (friendly)

### 4. Google Fonts

**Browse fonts:** https://fonts.google.com

```typescript
fonts: {
  sans: {
    name: "Inter",              // Change to any Google Font
    weights: [400, 500, 600, 700],
    fallback: "system-ui, sans-serif"
  },
  heading: {
    name: "Inter",              // Can be different from body
    weights: [600, 700, 800],
  },
  mono: {
    name: "Roboto Mono",
    weights: [400, 500],
  }
}
```

**Popular font combinations:**
- **Modern:** Inter (body) + Inter (headings)
- **Professional:** Open Sans + Montserrat
- **Friendly:** Nunito + Nunito
- **Classic:** Lato + Playfair Display
- **Clean:** Poppins + Poppins

### 5. Dashboard Settings
```typescript
dashboard: {
  sidebarTitle: "Menopause Care",  // Shows in sidebar
  showVersion: true,               // Show version in footer
  version: "1.0.0"
}
```

## 🚀 How to Apply Changes

1. Open `src/config/site.ts`
2. Change the values
3. Save the file
4. The app will automatically reload with new settings!

## 📚 Examples

### Example 1: Medical Blue Theme
```typescript
colors: {
  primary: {
    light: "oklch(0.5 0.15 240)",
    dark: "oklch(0.85 0.1 240)"
  }
}
```

### Example 2: Using Poppins Font
```typescript
fonts: {
  sans: {
    name: "Poppins",
    weights: [400, 500, 600, 700],
  }
}
```

### Example 3: Sharp Corners
```typescript
radius: "0",
```

## 💡 Tips

1. **Test colors in both light and dark mode**
2. **Use readable fonts** - avoid overly decorative fonts for body text
3. **Keep it consistent** - use 2-3 fonts maximum
4. **Check accessibility** - ensure sufficient color contrast

## 🔧 Advanced Customization

For more advanced styling, edit `src/app/[locale]/globals.css`
