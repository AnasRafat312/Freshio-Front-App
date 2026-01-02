# Details Components Module

Reusable components for displaying detail views with a modern, beautiful UI.

## Components

### 1. DetailHeaderComponent (`app-detail-header`)

Displays a header section with icon, title, and subtitle.

**Inputs:**
- `icon`: string - PrimeNG icon class (default: 'pi pi-info-circle')
- `title`: string - Main title text
- `subtitle`: string - Subtitle text (optional)

**Usage:**
```html
<!-- With inputs only -->
<app-detail-header 
    icon="pi pi-file-edit"
    [title]="'Need Request Details' | translateToArabic: languageFactor"
    [subtitle]="'View complete information' | translateToArabic: languageFactor">
</app-detail-header>

<!-- With custom content via ng-content -->
<app-detail-header icon="pi pi-file-edit">
    <h2>Custom Title</h2>
    <p>Custom subtitle or any content</p>
</app-detail-header>
```

---

### 2. DetailCardComponent (`app-detail-card`)

Container card with optional header and flexible body content.

**Inputs:**
- `title`: string - Card title (optional)
- `icon`: string - Icon for card header (default: 'pi pi-info-circle')
- `columns`: number - Grid columns (0=auto-fit, 2/3/4=fixed columns, default: 0)

**Usage:**
```html
<!-- Basic card with auto-fit grid -->
<app-detail-card 
    [title]="'General Information' | translateToArabic: languageFactor"
    icon="pi pi-info-circle">
    <!-- Content goes here -->
    <app-detail-item ...></app-detail-item>
    <app-detail-item ...></app-detail-item>
</app-detail-card>

<!-- Card with fixed 3-column grid -->
<app-detail-card 
    title="Product Details"
    icon="pi pi-box"
    [columns]="3">
    <!-- Content will be in 3 columns -->
</app-detail-card>

<!-- Card without header -->
<app-detail-card>
    <app-basic-table ...></app-basic-table>
</app-detail-card>
```

---

### 3. DetailItemComponent (`app-detail-item`)

Individual field display with icon, label, and formatted value.

**Inputs:**
- `icon`: string - PrimeNG icon class (default: 'pi pi-info-circle')
- `label`: string - Field label
- `value`: any - Field value
- `valueType`: 'text' | 'date' | 'amount' | 'number' (default: 'text')
- `fullWidth`: boolean - Span full width (default: false)
- `customClass`: string - Additional CSS classes
- `currencySymbol`: string - Currency symbol for amount type (optional)
- `minFractionDigits`: number - Min decimal places for amount (default: 0)
- `maxFractionDigits`: number - Max decimal places for amount (default: 4)

**Value Types:**
- `text`: Plain text display
- `date`: Formatted date (yyyy-MM-dd for EN, dd-MM-yyyy for AR)
- `amount`: Number with thousand separators and optional currency
- `number`: Number with up to 2 decimal places

**Usage:**
```html
<!-- Text field -->
<app-detail-item
    icon="pi pi-building"
    [label]="'Entity' | translateToArabic: languageFactor"
    [value]="data?.EntityName"
    valueType="text">
</app-detail-item>

<!-- Date field -->
<app-detail-item
    icon="pi pi-calendar"
    [label]="'Date' | translateToArabic: languageFactor"
    [value]="data?.Date"
    valueType="date">
</app-detail-item>

<!-- Amount with currency -->
<app-detail-item
    icon="pi pi-dollar"
    label="Total Amount"
    [value]="1234.5678"
    valueType="amount"
    currencySymbol="$"
    [minFractionDigits]="2"
    [maxFractionDigits]="2">
</app-detail-item>

<!-- Full width field (like description) -->
<app-detail-item
    icon="pi pi-align-left"
    [label]="'Description' | translateToArabic: languageFactor"
    [value]="data?.Description"
    valueType="text"
    [fullWidth]="true">
</app-detail-item>

<!-- With custom class -->
<app-detail-item
    icon="pi pi-info"
    label="Status"
    value="Active"
    customClass="status-active">
</app-detail-item>
```

---

## Complete Example

```html
<div class="container">
    <!-- Header -->
    <app-detail-header 
        icon="pi pi-file-edit"
        [title]="'Need Request Details' | translateToArabic: languageFactor"
        [subtitle]="'View complete information' | translateToArabic: languageFactor">
    </app-detail-header>

    <!-- General Information Card -->
    <app-detail-card 
        [title]="'General Information' | translateToArabic: languageFactor"
        icon="pi pi-info-circle">
        
        <app-detail-item
            icon="pi pi-calendar"
            [label]="'Date' | translateToArabic: languageFactor"
            [value]="data?.Date"
            valueType="date">
        </app-detail-item>

        <app-detail-item
            icon="pi pi-building"
            [label]="'Entity' | translateToArabic: languageFactor"
            [value]="data?.EntityName"
            valueType="text">
        </app-detail-item>

        <app-detail-item
            icon="pi pi-dollar"
            label="Amount"
            [value]="data?.Amount"
            valueType="amount"
            currencySymbol="$"
            [minFractionDigits]="2"
            [maxFractionDigits]="2">
        </app-detail-item>

        <app-detail-item
            icon="pi pi-align-left"
            [label]="'Description' | translateToArabic: languageFactor"
            [value]="data?.Description"
            valueType="text"
            [fullWidth]="true">
        </app-detail-item>
    </app-detail-card>

    <!-- Items Table Card -->
    <app-detail-card 
        [title]="'Items' | translateToArabic: languageFactor"
        icon="pi pi-list">
        <app-basic-table
            [mainList]="data?.Items"
            [filteredList]="data?.Items"
            [model]="tableModel">
        </app-basic-table>
    </app-detail-card>
</div>
```

---

## Module Import

Add `DetailsModule` to your module imports:

```typescript
import { DetailsModule } from 'src/app/shared/components/details/details.module';

@NgModule({
  imports: [
    CommonModule,
    DetailsModule,
    // ... other imports
  ]
})
export class YourModule { }
```

---

## Styling

All components come with pre-styled modern UI:
- Light blue gradient header
- Card-based layout with hover effects
- Responsive grid (auto-adjusts for mobile)
- Icon-based visual indicators
- Smooth transitions and animations

The components use a consistent color scheme that can be customized by overriding the CSS variables in your global styles.

---

## Features

✅ Fully responsive (mobile-friendly)
✅ RTL/LTR support via language service
✅ Automatic date formatting based on language
✅ Flexible amount formatting (0-4 decimal places)
✅ Custom content via ng-content
✅ Grid layout options (auto-fit or fixed columns)
✅ Full-width items for long text
✅ Custom CSS classes support
✅ Modern, beautiful UI out of the box
