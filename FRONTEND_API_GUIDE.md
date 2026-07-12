# Freshio Web API - Frontend Developer Guide

This guide provides a simplified reference for frontend developers integrating with the Freshio Web API.

---

## AuthenticationController

### POST /api/Authentication/Register
**Description:** Register a new user account
**Request DTO:** `RegisterRequestDTO`
**Response DTO:** `AuthenticationResponseDTO`

### POST /api/Authentication/Login
**Description:** Login with email and password
**Request DTO:** `LoginRequestDTO`
**Response DTO:** `AuthenticationResponseDTO`

### POST /api/Authentication/Logout
**Description:** Logout current user
**Request DTO:** None
**Response DTO:** Simple object with message

---

## EntitiesController

### GET /api/Entities/GetAllEntities
**Description:** Get all entities (customers, suppliers, employees, drivers)
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<EntityDTO>>`

### GET /api/Entities/GetEntity/{id}
**Description:** Get a specific entity by ID
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<EntityDTO>`

### GET /api/Entities/GetEntitiesByRoleType/{roleType}
**Description:** Get entities filtered by role type
**Request DTO:** None (roleType in route: Customer, Supplier, Employee, Driver)
**Response DTO:** `ApiResponse<IEnumerable<EntityDTO>>`

### POST /api/Entities/CreateEntity
**Description:** Create a new entity
**Request DTO:** `CreateEntityDTO`
**Response DTO:** `ApiResponse<EntityDTO>`

### PUT /api/Entities/UpdateEntity/{id}
**Description:** Update an existing entity
**Request DTO:** `UpdateEntityDTO` (id in route)
**Response DTO:** `ApiResponse<EntityDTO>`

### DELETE /api/Entities/DeleteEntity/{id}
**Description:** Soft delete an entity
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse`

---

## ItemsController

### GET /api/Items/GetAllItems
**Description:** Get all items in inventory
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<ItemDTO>>`

### GET /api/Items/GetItem/{id}
**Description:** Get a specific item by ID
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<ItemDTO>`

### POST /api/Items/CreateItem
**Description:** Create a new item
**Request DTO:** `CreateItemDTO`
**Response DTO:** `ApiResponse<ItemDTO>`

### PUT /api/Items/UpdateItem/{id}
**Description:** Update an existing item
**Request DTO:** `UpdateItemDTO` (id in route)
**Response DTO:** `ApiResponse<ItemDTO>`

### DELETE /api/Items/DeleteItem/{id}
**Description:** Soft delete an item
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse`

### GET /api/Items/GetAllItemsStockSummary
**Description:** Get stock summary for all items
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<ItemStockSummaryDTO>>`

### GET /api/Items/GetItemStockSummary/{id}
**Description:** Get stock summary for a specific item
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<ItemStockSummaryDTO>`

---

## PurchaseOrderController

### POST /api/PurchaseOrder/CreatePurchaseOrder
**Description:** Create a new purchase order
**Request DTO:** `CreatePurchaseOrderDTO`
**Response DTO:** `ApiResponse<PurchaseOrderDTO>`

### GET /api/PurchaseOrder/GetPurchaseOrderById/{id}
**Description:** Get a specific purchase order by ID
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<PurchaseOrderDTO>`

### GET /api/PurchaseOrder/GetAllPurchaseOrders
**Description:** Get all purchase orders
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<PurchaseOrderDTO>>`

### PUT /api/PurchaseOrder/UpdatePurchaseOrder/{id}
**Description:** Update an existing purchase order
**Request DTO:** `UpdatePurchaseOrderDTO` (id in route)
**Response DTO:** `ApiResponse<PurchaseOrderDTO>`

### DELETE /api/PurchaseOrder/DeletePurchaseOrder/{id}
**Description:** Soft delete a purchase order
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse`

### GET /api/PurchaseOrder/GetPurchaseOrdersBySupplier/{supplierEntityId}
**Description:** Get purchase orders for a specific supplier
**Request DTO:** None (supplierEntityId in route)
**Response DTO:** `ApiResponse<IEnumerable<PurchaseOrderDTO>>`

### POST /api/PurchaseOrder/GetPurchaseOrdersByDateRange
**Description:** Get purchase orders within a date range
**Request DTO:** `DateRangeDTO`
**Response DTO:** `ApiResponse<IEnumerable<PurchaseOrderDTO>>`

---

## SalesOrderController

### POST /api/SalesOrder/CreateSalesOrder
**Description:** Create a new sales order
**Request DTO:** `CreateSalesOrderDTO`
**Response DTO:** `ApiResponse<SalesOrderDTO>`

### GET /api/SalesOrder/GetSalesOrderById/{id}
**Description:** Get a specific sales order by ID
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<SalesOrderDTO>`

### GET /api/SalesOrder/GetAllSalesOrders
**Description:** Get all sales orders
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<SalesOrderDTO>>`

### PUT /api/SalesOrder/UpdateSalesOrder/{id}
**Description:** Update an existing sales order
**Request DTO:** `UpdateSalesOrderDTO` (id in route)
**Response DTO:** `ApiResponse<SalesOrderDTO>`

### DELETE /api/SalesOrder/DeleteSalesOrder/{id}
**Description:** Soft delete a sales order
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse`

### POST /api/SalesOrder/ApproveSalesOrder/{id}
**Description:** Approve a sales order
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<SalesOrderDTO>`

### POST /api/SalesOrder/PartiallyApproveSalesOrder/{id}
**Description:** Partially approve a sales order
**Request DTO:** `PartiallyApproveSalesOrderDTO` (id in route)
**Response DTO:** `ApiResponse<SalesOrderDTO>`

### POST /api/SalesOrder/RejectSalesOrder/{id}
**Description:** Reject a sales order
**Request DTO:** `RejectSalesOrderDTO` (id in route)
**Response DTO:** `ApiResponse<SalesOrderDTO>`

### GET /api/SalesOrder/GetOrderShortages/{id}
**Description:** Get shortages for a sales order
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<IEnumerable<OrderShortageDTO>>`

### GET /api/SalesOrder/GetSalesOrdersByCustomer/{customerEntityId}
**Description:** Get sales orders for a specific customer
**Request DTO:** None (customerEntityId in route)
**Response DTO:** `ApiResponse<IEnumerable<SalesOrderDTO>>`

### GET /api/SalesOrder/GetPendingSalesOrders
**Description:** Get all pending sales orders
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<SalesOrderDTO>>`

---

## StockMovementController

### POST /api/StockMovement/CreateStockMovement
**Description:** Create a stock movement
**Request DTO:** `CreateStockMovementDTO`
**Response DTO:** `ApiResponse<StockMovementDTO>`

### GET /api/StockMovement/GetStockMovementById/{id}
**Description:** Get a specific stock movement by ID
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<StockMovementDTO>`

### GET /api/StockMovement/GetAllStockMovements
**Description:** Get all stock movements
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<StockMovementDTO>>`

### GET /api/StockMovement/GetStockMovementsByItemId/{itemId}
**Description:** Get stock movements for a specific item
**Request DTO:** None (itemId in route)
**Response DTO:** `ApiResponse<IEnumerable<StockMovementDTO>>`

### POST /api/StockMovement/GetStockMovementsByDateRange
**Description:** Get stock movements within a date range
**Request DTO:** `DateRangeDTO`
**Response DTO:** `ApiResponse<IEnumerable<StockMovementDTO>>`

### POST /api/StockMovement/CreateStockAdjustment
**Description:** Create a manual stock adjustment
**Request DTO:** `StockAdjustmentDTO`
**Response DTO:** `ApiResponse`

---

## WasteOrderController

### POST /api/WasteOrder/CreateWasteOrder
**Description:** Create a new waste order
**Request DTO:** `CreateWasteOrderDTO`
**Response DTO:** `ApiResponse<WasteOrderDTO>`

### GET /api/WasteOrder/GetWasteOrderById/{id}
**Description:** Get a specific waste order by ID
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse<WasteOrderDTO>`

### GET /api/WasteOrder/GetAllWasteOrders
**Description:** Get all waste orders
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<WasteOrderDTO>>`

### PUT /api/WasteOrder/UpdateWasteOrder/{id}
**Description:** Update an existing waste order
**Request DTO:** `UpdateWasteOrderDTO` (id in route)
**Response DTO:** `ApiResponse<WasteOrderDTO>`

### DELETE /api/WasteOrder/DeleteWasteOrder/{id}
**Description:** Soft delete a waste order
**Request DTO:** None (id in route)
**Response DTO:** `ApiResponse`

### GET /api/WasteOrder/GetWasteOrdersByEmployee/{employeeEntityId}
**Description:** Get waste orders for a specific employee
**Request DTO:** None (employeeEntityId in route)
**Response DTO:** `ApiResponse<IEnumerable<WasteOrderDTO>>`

### POST /api/WasteOrder/GetWasteOrdersByDateRange
**Description:** Get waste orders within a date range
**Request DTO:** `DateRangeDTO`
**Response DTO:** `ApiResponse<IEnumerable<WasteOrderDTO>>`

---

## ReportsController

### GET /api/Reports/GetStockShortageReport
**Description:** Get stock shortage report
**Request DTO:** `StockShortageReportRequestDTO` (from query)
**Response DTO:** `ApiResponse<IEnumerable<StockShortageReportDTO>>`

### POST /api/Reports/GetSalesReport
**Description:** Get sales report for a date range
**Request DTO:** `DateRangeDTO`
**Response DTO:** `ApiResponse<IEnumerable<SalesReportDTO>>`

### POST /api/Reports/GetPurchaseReport
**Description:** Get purchase report for a date range
**Request DTO:** `DateRangeDTO`
**Response DTO:** `ApiResponse<IEnumerable<PurchaseReportDTO>>`

### GET /api/Reports/GetInventoryReport
**Description:** Get comprehensive inventory report
**Request DTO:** None
**Response DTO:** `ApiResponse<IEnumerable<InventoryReportDTO>>`

---

## WeatherForecastController

### GET /api/WeatherForecast/Get
**Description:** Demo endpoint - returns sample weather data
**Request DTO:** None
**Response DTO:** `IEnumerable<WeatherForecast>`

**Note:** This is a demo endpoint for testing only.

---

## Common DTOs

### ApiResponse<T>
Standard response wrapper for all endpoints (except Authentication and WeatherForecast).
```json
{
  "Success": bool,
  "Message": string,
  "Data": T | null,
  "Errors": string[],
  "StatusCode": int,
  "Shortages": object | null
}
```

### DateRangeDTO
Used for date range filtering.
```json
{
  "StartDate": DateTime | null,
  "EndDate": DateTime | null
}
```

---

## DTO Reference

### Authentication DTOs

#### RegisterRequestDTO
```json
{
  "Email": string (required, email format),
  "Password": string (required, min 6 chars, max 100 chars),
  "UserName": string (required, max 100 chars)
}
```

#### LoginRequestDTO
```json
{
  "Email": string (required, email format),
  "Password": string (required)
}
```

#### AuthenticationResponseDTO
```json
{
  "UserId": string,
  "Email": string,
  "UserName": string,
  "Token": string
}
```

### Entity DTOs

#### EntityDTO
```json
{
  "ID": long (inherited from BaseEntity),
  "Name": string,
  "WhatsAppNumber": string | null,
  "AdditionalPhone": string | null,
  "Address": string | null,
  "GoogleMapUrl": string | null,
  "Latitude": decimal | null,
  "Longitude": decimal | null,
  "Notes": string | null,
  "IsActive": bool,
  "CreatedAt": DateTime,
  "UpdatedAt": DateTime | null,
  "IsCustomer": bool,
  "IsSupplier": bool,
  "IsEmployee": bool,
  "IsDriver": bool
}
```

#### CreateEntityDTO
```json
{
  "Name": string,
  "WhatsAppNumber": string | null,
  "AdditionalPhone": string | null,
  "Address": string | null,
  "GoogleMapUrl": string | null,
  "Latitude": decimal | null,
  "Longitude": decimal | null,
  "Notes": string | null,
  "IsCustomer": bool (default: false),
  "IsSupplier": bool (default: false),
  "IsEmployee": bool (default: false),
  "IsDriver": bool (default: false),
  "IsActive": bool (default: true)
}
```

#### UpdateEntityDTO
```json
{
  "Name": string,
  "WhatsAppNumber": string | null,
  "AdditionalPhone": string | null,
  "Address": string | null,
  "GoogleMapUrl": string | null,
  "Latitude": decimal | null,
  "Longitude": decimal | null,
  "Notes": string | null,
  "IsCustomer": bool (default: false),
  "IsSupplier": bool (default: false),
  "IsEmployee": bool (default: false),
  "IsDriver": bool (default: false),
  "IsActive": bool
}
```

### Item DTOs

#### ItemDTO
```json
{
  "ID": long (inherited from BaseEntity),
  "Name": string,
  "UnitOfMeasure": string,
  "DefaultSellPrice": decimal | null,
  "AveragePurchasePrice": decimal,
  "MinimumStockQuantity": decimal | null,
  "IsActive": bool,
  "CreatedAt": DateTime,
  "UpdatedAt": DateTime | null,
  "Inventory": InventoryDTO | null
}
```

#### CreateItemDTO
```json
{
  "Name": string,
  "UnitOfMeasure": string,
  "DefaultSellPrice": decimal | null,
  "AveragePurchasePrice": decimal,
  "MinimumStockQuantity": decimal | null,
  "IsActive": bool (default: true)
}
```

#### UpdateItemDTO
```json
{
  "Name": string,
  "UnitOfMeasure": string,
  "DefaultSellPrice": decimal | null,
  "MinimumStockQuantity": decimal | null,
  "IsActive": bool
}
```

#### ItemStockSummaryDTO
```json
{
  "ID": long,
  "Name": string,
  "UnitOfMeasure": string,
  "AvailableQuantity": decimal,
  "MinimumStockQuantity": decimal | null,
  "AveragePurchasePrice": decimal,
  "IsActive": bool
}
```

### Purchase Order DTOs

#### CreatePurchaseOrderDTO
```json
{
  "PurchaseDate": DateTime (default: UTC now),
  "SupplierEntityId": long | null,
  "ExternalSupplierName": string | null,
  "EmployeeEntityId": long | null,
  "Notes": string | null,
  "PurchaseOrderItems": CreatePurchaseOrderItemDTO[]
}
```

#### CreatePurchaseOrderItemDTO
```json
{
  "ItemId": long,
  "Quantity": decimal,
  "UnitPrice": decimal
}
```

#### PurchaseOrderDTO
```json
{
  "ID": long (inherited from BaseEntity),
  "PurchaseNumber": string,
  "PurchaseDate": DateTime,
  "SupplierEntityId": long | null,
  "SupplierName": string | null,
  "ExternalSupplierName": string | null,
  "EmployeeEntityId": long | null,
  "EmployeeName": string | null,
  "Notes": string | null,
  "TotalAmount": decimal,
  "CreatedAt": DateTime,
  "PurchaseOrderItems": PurchaseOrderItemDTO[]
}
```

#### PurchaseOrderItemDTO
```json
{
  "ID": long,
  "PurchaseOrderId": long,
  "ItemId": long,
  "ItemName": string,
  "ItemUnitOfMeasure": string,
  "Quantity": decimal,
  "UnitPrice": decimal,
  "TotalPrice": decimal
}
```

#### UpdatePurchaseOrderDTO
```json
{
  "PurchaseDate": DateTime,
  "SupplierEntityId": long | null,
  "ExternalSupplierName": string | null,
  "EmployeeEntityId": long | null,
  "Notes": string | null,
  "PurchaseOrderItems": UpdatePurchaseOrderItemDTO[]
}
```

#### UpdatePurchaseOrderItemDTO
```json
{
  "ItemId": long,
  "Quantity": decimal,
  "UnitPrice": decimal
}
```

### Sales Order DTOs

#### CreateSalesOrderDTO
```json
{
  "CustomerEntityId": long,
  "OrderDate": DateTime (default: UTC now),
  "Notes": string | null,
  "SalesOrderItems": CreateSalesOrderItemDTO[]
}
```

#### CreateSalesOrderItemDTO
```json
{
  "ItemId": long,
  "RequestedQuantity": decimal,
  "UnitPrice": decimal,
  "Notes": string | null
}
```

#### SalesOrderDTO
```json
{
  "Id": long,
  "OrderNumber": string,
  "CustomerEntityId": long,
  "CustomerName": string,
  "OrderDate": DateTime,
  "Status": SalesOrderStatus (enum),
  "TotalAmount": decimal,
  "TotalCost": decimal | null,
  "TotalProfit": decimal | null,
  "Notes": string | null,
  "RejectionReason": string | null,
  "ApprovedAt": DateTime | null,
  "RejectedAt": DateTime | null,
  "CreatedAt": DateTime,
  "UpdatedAt": DateTime | null,
  "SalesOrderItems": SalesOrderItemDTO[]
}
```

#### SalesOrderItemDTO
```json
{
  "Id": long,
  "SalesOrderId": long,
  "ItemId": long,
  "ItemName": string,
  "ItemUnitOfMeasure": string,
  "RequestedQuantity": decimal,
  "ApprovedQuantity": decimal | null,
  "UnitPrice": decimal,
  "UnitCost": decimal | null,
  "TotalCost": decimal | null,
  "Profit": decimal | null,
  "Notes": string | null
}
```

#### UpdateSalesOrderDTO
```json
{
  "Notes": string | null,
  "SalesOrderItems": UpdateSalesOrderItemDTO[]
}
```

#### UpdateSalesOrderItemDTO
```json
{
  "RequestedQuantity": decimal,
  "UnitPrice": decimal,
  "Notes": string | null
}
```

#### PartiallyApproveSalesOrderDTO
```json
{
  "SalesOrderItems": ApproveSalesOrderItemDTO[]
}
```

#### ApproveSalesOrderItemDTO
```json
{
  "OrderItemId": long,
  "ApprovedQuantity": decimal
}
```

#### RejectSalesOrderDTO
```json
{
  "RejectionReason": string
}
```

#### OrderShortageDTO
```json
{
  "OrderItemId": long,
  "ItemId": long,
  "ItemName": string,
  "RequestedQuantity": decimal,
  "AvailableQuantity": decimal,
  "MissingQuantity": decimal
}
```

### Stock Movement DTOs

#### CreateStockMovementDTO
```json
{
  "ItemId": long,
  "MovementType": StockMovementType (enum),
  "Quantity": decimal,
  "UnitCost": decimal | null,
  "ReferenceType": StockReferenceType (enum),
  "ReferenceId": long,
  "Notes": string | null
}
```

#### StockMovementDTO
```json
{
  "Id": long,
  "ItemId": long,
  "ItemName": string,
  "MovementType": StockMovementType (enum),
  "Quantity": decimal,
  "UnitCost": decimal | null,
  "ReferenceType": StockReferenceType (enum),
  "ReferenceId": long,
  "Notes": string | null,
  "CreatedAt": DateTime
}
```

#### StockAdjustmentDTO
```json
{
  "ItemId": long,
  "Quantity": decimal (positive for increase, negative for decrease),
  "UnitCost": decimal | null,
  "Notes": string | null
}
```

### Waste Order DTOs

#### CreateWasteOrderDTO
```json
{
  "WasteDate": DateTime (default: UTC now),
  "EmployeeEntityId": long | null,
  "Reason": string | null,
  "Notes": string | null,
  "WasteOrderItems": CreateWasteOrderItemDTO[]
}
```

#### CreateWasteOrderItemDTO
```json
{
  "ItemId": long,
  "Quantity": decimal
}
```

#### WasteOrderDTO
```json
{
  "Id": long,
  "WasteNumber": string,
  "WasteDate": DateTime,
  "EmployeeEntityId": long | null,
  "EmployeeName": string | null,
  "Reason": string | null,
  "Notes": string | null,
  "CreatedAt": DateTime,
  "WasteOrderItems": WasteOrderItemDTO[]
}
```

#### WasteOrderItemDTO
```json
{
  "ID": long,
  "WasteOrderId": long,
  "ItemId": long,
  "ItemName": string,
  "ItemUnitOfMeasure": string,
  "Quantity": decimal
}
```

#### UpdateWasteOrderDTO
```json
{
  "WasteDate": DateTime,
  "EmployeeEntityId": long | null,
  "Reason": string | null,
  "Notes": string | null,
  "WasteOrderItems": UpdateWasteOrderItemDTO[]
}
```

#### UpdateWasteOrderItemDTO
```json
{
  "ItemId": long,
  "Quantity": decimal
}
```

### Report DTOs

#### StockShortageReportRequestDTO
```json
{
  "FromDate": DateTime | null,
  "ToDate": DateTime | null,
  "CustomerId": long | null
}
```

#### StockShortageReportDTO
```json
{
  "ItemId": long,
  "ItemName": string,
  "UnitOfMeasure": string,
  "RequiredQuantity": decimal,
  "AvailableQuantity": decimal,
  "MissingQuantity": decimal,
  "AveragePurchasePrice": decimal,
  "EstimatedPurchaseCost": decimal
}
```

#### SalesReportDTO
```json
{
  "SalesOrderId": long,
  "OrderNumber": string,
  "CustomerName": string,
  "OrderDate": DateTime,
  "Status": string,
  "TotalAmount": decimal,
  "TotalProfit": decimal | null,
  "ProfitMargin": decimal
}
```

#### PurchaseReportDTO
```json
{
  "PurchaseOrderId": long,
  "PurchaseNumber": string,
  "SupplierName": string | null,
  "PurchaseDate": DateTime,
  "TotalAmount": decimal
}
```

#### InventoryReportDTO
```json
{
  "ItemId": long,
  "ItemName": string,
  "UnitOfMeasure": string,
  "AvailableQuantity": decimal,
  "AveragePurchasePrice": decimal,
  "TotalValue": decimal,
  "MinimumStockQuantity": decimal | null,
  "StockStatus": StockStatus (enum)
}
```

---

## Enums Reference

### RoleType
- `Customer = 1`
- `Supplier = 2`
- `Employee = 3`
- `Driver = 4`

### SalesOrderStatus
- `Pending = 1`
- `Approved = 2`
- `PartiallyApproved = 3`
- `Rejected = 4`
- `Delivered = 5`
- `Cancelled = 6`

### StockMovementType
- `PurchaseIn = 1`
- `SalesOut = 2`
- `WasteOut = 3`
- `AdjustmentIn = 4`
- `AdjustmentOut = 5`
- `ReturnIn = 6`

### StockReferenceType
- `PurchaseOrder = 1`
- `SalesOrder = 2`
- `WasteOrder = 3`
- `ManualAdjustment = 4`

### StockStatus
- `OutOfStock = 1`
- `LowStock = 2`
- `Normal = 3`

### WasteOrderStatus
- `Draft = 1`
- `Confirmed = 2`
- `Processed = 3`
- `Cancelled = 4`

---

## Notes

- All monetary values are in decimal format
- Date/time values are in UTC
- Soft delete is used (items marked with IsDeleted flag)
- Authentication endpoints do not use ApiResponse wrapper
- Authorization is enabled - Bearer token required for most endpoints (except Authentication endpoints)
- Token is returned in Register and Login responses and should be used in Authorization header for subsequent requests
