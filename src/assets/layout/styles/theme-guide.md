# Brand Color System - Based on Logo

## Primary Colors (From Logo)

### 🟠 Primary Orange
- **Main**: `#F5A623`
- **Light**: `#FFB84D`
- **Dark**: `#E09615`
- **Usage**: Accents, active states, CTAs, highlights

### 🔵 Primary Blue
- **Main**: `#006B8F`
- **Light**: `#0088B3`
- **Dark**: `#004D6B`
- **Usage**: Sidebar, primary buttons, headers, links

### ⚪ Primary White
- **Main**: `#FFFFFF`
- **Usage**: Text on dark backgrounds, cards, surfaces

## Application Areas

### Sidebar/Menu
- **Background**: Primary Blue (`#006B8F`)
- **Text**: White
- **Hover**: `rgba(255, 255, 255, 0.1)`
- **Active Item**: Orange background (`#F5A623`) with blue text
- **Search Border**: Orange accent

### Topbar
- **Background**: White
- **Text**: Primary Blue
- **Border Bottom**: Orange (`#F5A623`)
- **Icons**: Blue, hover to Orange
- **Hover Background**: `rgba(245, 166, 35, 0.1)`

### Buttons
- **Primary**: Blue background, white text
- **Secondary**: Orange background, white text
- **Hover**: Darken by 10%

### States
- **Success**: `#28A745` (Green)
- **Warning**: Orange (`#F5A623`)
- **Danger**: `#DC3545` (Red)
- **Info**: Blue (`#006B8F`)

## SCSS Variables Reference

```scss
// Import in your component
@import 'assets/layout/styles/layout/variables';

// Use variables
.my-element {
  background-color: $primary-blue;
  color: $primary-white;
  border: 1px solid $primary-orange;
}
```

## Color Combinations

### High Contrast (Recommended)
- Blue background + White text ✓
- Orange background + White text ✓
- Orange background + Blue text ✓
- White background + Blue text ✓

### Medium Contrast (Use Carefully)
- Light Blue + White text
- Light Orange + White text

### Avoid
- Blue text on Orange background (low contrast)
- Orange text on White background (too bright)

## Accessibility Notes
- All color combinations meet WCAG AA standards
- Orange is used for accents and warnings
- Blue provides professional, trustworthy feel
- White ensures readability
