# Waste Details View Component Update

## Overview
Updated the Waste Details view component to properly display all waste types (Item, Material, Delivery) with appropriate columns and conditional rendering.

## Changes Made

### 1. Model Updates (`waste.model.ts`)

#### Enhanced WasteOrderItemModel
```typescript
export interface WasteOrderItemModel {
    ID?: number;
    WasteOrderId?: number;
    ItemId: number | null;           // Now nullable for Delivery
    ItemName?: string;
    ItemUnitOfMeasure?: string;       // Added backend field
    UnitOfMeasure?: string;
    AvailableQuantity?: number;
    Quantity: number;
    WasteType: WasteType;
    WasteTypeName?: string;           // Added from backend
    Cost?: number;                    // Added from backend
}
```

### 2. Component Updates (`details.component.ts`)

#### Added Helper Methods
```typescript
// Expose WasteType enum to template
readonly WasteType = WasteType;

// Check if item is Item or Material type
isItemOrMaterial(item: WasteOrderItemModel): boolean {
    return item.WasteType === WasteType.Items || item.WasteType === WasteType.Materials;
}

// Check if item is Delivery type
isDelivery(item: WasteOrderItemModel): boolean {
    return item.WasteType === WasteType.Delivery;
}

// Get display name for reference column
getItemDisplayName(item: WasteOrderItemModel): string {
    if (this.isDelivery(item)) {
        return this.getLabel('Delivery Waste', 'هالك توصيل');
    }
    return item.ItemName || '-';
}
```

### 3. Template Updates (`details.component.html`)

#### Updated Table Structure

**Column Layout:**
1. **Type** - Shows waste type badge (Item/Material/Delivery)
2. **Reference** - Shows item/material name or "Delivery Waste"
3. **Unit** - Shows unit for Item/Material, "—" for Delivery
4. **Quantity** - Shows quantity for Item/Material, "—" for Delivery
5. **Waste Value** - Shows unit cost for Item/Material, total amount for Delivery
6. **Total** - Shows total cost (always visible)

#### Conditional Rendering Logic

**For Item/Material:**
- Reference: Item/Material name
- Unit: Unit of measure
- Quantity: Actual quantity (formatted to 2 decimals)
- Waste Value: Unit cost (Cost ÷ Quantity)
- Total: Total cost

**For Delivery:**
- Reference: "Delivery Waste" label
- Unit: "—" (em dash)
- Quantity: "—" (em dash)
- Waste Value: Total waste amount (Cost field)
- Total: Total cost (same as Waste Value)

#### Angular 18 Syntax
```html
@if (isItemOrMaterial(item)) {
  {{ item.ItemUnitOfMeasure || item.UnitOfMeasure || '-' }}
} @else {
  <span class="text-muted">—</span>
}
```

### 4. Styling Updates (`details.component.scss`)

#### Added Badge Styling
```scss
.badge {
  display: inline-block;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.25rem;

  &.badge-info {
    color: #fff;
    background-color: #17a2b8;
  }
}
```

#### Added Text Muted Styling
```scss
.text-muted {
  color: #6c757d !important;
  font-style: italic;
}
```

## Example Data Handling

### Backend Response
```json
{
    "ID": 10,
    "WasteNumber": "WO202600001",
    "WasteDate": "2026-08-04T00:00:00",
    "EmployeeEntityId": 1,
    "EmployeeName": "Anas Rafat Mansour",
    "WasteOrderItems": [
        {
            "ID": 6,
            "WasteOrderId": 10,
            "ItemId": null,
            "ItemName": "",
            "ItemUnitOfMeasure": "",
            "Quantity": 1,
            "WasteType": 2,
            "WasteTypeName": "Delivery",
            "Cost": 300
        }
    ]
}
```

### Display Output
| Type | Reference | Unit | Quantity | Waste Value | Total |
|------|-----------|------|----------|-------------|-------|
| Delivery | Delivery Waste | — | — | 300.00 | 300.00 |

### Item/Material Example
| Type | Reference | Unit | Quantity | Waste Value | Total |
|------|-----------|------|----------|-------------|-------|
| Item | Tomatoes (kg) | kg | 5.00 | 2.50 | 12.50 |

## Key Features

### 1. Type Badge
- Visual indicator of waste type
- Color-coded (info blue)
- Shows backend WasteTypeName

### 2. Conditional Columns
- Unit, Quantity only shown for Item/Material
- "—" (em dash) shown for Delivery to maintain table alignment
- Clean, professional appearance

### 3. Waste Value Calculation
- **Item/Material**: Calculates unit cost = Cost ÷ Quantity
- **Delivery**: Shows total Cost directly
- Formatted to 2 decimal places

### 4. Responsive Design
- Table scrolls horizontally on small screens
- Maintains readability across devices

### 5. Internationalization
- All labels support English/Arabic
- "Delivery Waste" properly translated
- Consistent with add/edit form

## Validation

### Null Safety
- Handles null ItemId for Delivery
- Handles empty ItemName gracefully
- Falls back to UnitOfMeasure if ItemUnitOfMeasure is missing
- Safe division for unit cost calculation

### Empty State
- Shows message when no waste details found
- Proper colspan for all 6 columns

## Integration Points

### From List Component
```typescript
onView(waste: WasteOrderModel): void {
  this.ref = this.dialogService.open(
    WasteDetailsComponent,
    {
      header: this.languageFactor === 'en' ? 'Waste Details' : 'تفاصيل الهالك',
      data: waste,  // Full waste record with WasteOrderItems
      // ... other config
    }
  );
}
```

### Data Flow
1. User clicks view on waste record
2. List component opens dialog with waste data
3. Details component receives data via DynamicDialogConfig
4. Template renders based on WasteType
5. Conditional logic shows/hides columns
6. User sees properly formatted waste details

## Testing Checklist

- [x] Delivery type shows "—" for Unit and Quantity
- [x] Delivery type shows Cost in Waste Value column
- [x] Item/Material shows unit cost calculation
- [x] Type badge displays correctly
- [x] Reference column shows appropriate text
- [x] Total column always shows cost
- [x] Empty state displays properly
- [x] Responsive layout works on mobile
- [x] Arabic translation works correctly
- [x] Null ItemId handled gracefully

## Files Modified

1. `src/app/shared/model/freshio/waste.model.ts`
2. `src/app/components/pages/waste/components/details/details.component.ts`
3. `src/app/components/pages/waste/components/details/details.component.html`
4. `src/app/components/pages/waste/components/details/details.component.scss`

## Consistency with Add/Edit Form

The details view now matches the add/edit form structure:
- Same column names (Type, Reference, Unit, Quantity, Waste Value, Total)
- Same conditional rendering logic
- Same "—" for hidden Delivery fields
- Same Angular 18 @if/@else syntax
- Consistent user experience

## Future Enhancements

1. **Color-coded Type Badges**
   - Item: Blue
   - Material: Green
   - Delivery: Orange

2. **Expandable Rows**
   - Show additional details on click
   - Delivery reference/notes
   - Item inventory history

3. **Export Functionality**
   - PDF export of waste details
   - Excel export with all columns

4. **Audit Trail**
   - Show who created the waste record
   - Show modification history
   - Link to related transactions
