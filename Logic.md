نفذ Frontend لنظام إدارة توزيع أوردرات خضار وفاكهة باستخدام Angular 18.

المطلوب Frontend عملي ومنظم ويدعم دورة العمل التالية:

* إدارة الأصناف.
* إدارة المخزون.
* إدارة العملاء والتجار والموظفين والسائقين.
* إنشاء عمليات شراء.
* إنشاء أوردرات بدون منع الكميات الأكبر من المخزون.
* عرض تقرير النواقص.
* الموافقة الكاملة بشرط أن المخزون يغطي كل الأصناف.
* الموافقة الجزئية.
* رفض الأوردر.
* تسجيل الهالك.
* طباعة فاتورة.
* إنشاء مسار توصيل على Google Maps.

استخدم Angular standalone components أو modular architecture حسب الأفضل، مع فصل واضح بين:

* Pages
* Components
* Dialogs
* Services
* Models
* Guards
* Interceptors

---

## Frontend Modules

نفذ الصفحات التالية:

1. Dashboard
2. Items
3. Inventory
4. Entities
5. Purchases
6. Sales Orders
7. Stock Shortages Report
8. Waste
9. Invoice Preview
10. Delivery Routes
11. Reports
12. Settings

---

## Items Page

صفحة إدارة الأصناف.

Columns:

* Name
* UnitOfMeasure
* DefaultSellPrice
* AveragePurchasePrice
* MinimumStockQuantity
* IsActive
* Actions

Features:

* Add Item
* Edit Item
* Disable Item
* Search
* Pagination
* Sorting

مهم:

* لا تعرض AvailableQuantity من جدول Items.
* المخزون يأتي من Inventory أو Stock Summary API.

---

## Inventory Page

صفحة عرض المخزون الحالي.

Columns:

* ItemName
* UnitOfMeasure
* AvailableQuantity
* AveragePurchasePrice
* MinimumStockQuantity
* StockStatus

StockStatus:

* Normal
* Low Stock
* Out of Stock

Features:

* Search by item name
* Filter low stock only
* Export Excel
* Print

---

## Entities Page

صفحة واحدة لإدارة:

* Customers
* Suppliers
* Employees
* Drivers

Filters:

* All
* Customer
* Supplier
* Employee
* Driver

Form Fields:

* Name
* WhatsAppNumber
* AdditionalPhone
* Address
* GoogleMapUrl
* Latitude
* Longitude
* Roles
* Notes
* IsActive

Features:

* Add Entity
* Edit Entity
* Select Roles
* Pick Location from Google Map
* Open Location Link

---

## Purchases Page

### Purchase List

Columns:

* PurchaseNumber
* PurchaseDate
* Supplier
* Employee
* TotalAmount
* Actions

Actions:

* View
* Print
* Edit if allowed

### Create Purchase Page

Header Fields:

* PurchaseDate
* SupplierEntityId optional
* ExternalSupplierName optional
* EmployeeEntityId optional
* Notes

Details Grid:

* Item
* Quantity
* UnitPrice
* TotalPrice
* Delete Row

Behavior:

* User selects item.
* User enters quantity and unit price.
* Total is calculated on frontend.
* On save, call POST /api/purchases.
* After save, backend updates Inventory and AveragePurchasePrice.

---

## Sales Orders Page

### Sales Order List

Columns:

* OrderNumber
* OrderDate
* CustomerName
* Status
* TotalAmount
* TotalProfit
* Actions

Actions حسب الحالة:

لو Pending:

* View
* Edit
* Approve Full
* Partial Approve
* Reject
* View Shortages

لو Approved أو PartiallyApproved:

* View
* Invoice
* Add to Delivery Route

لو Rejected:

* View

---

## Create Sales Order Page

Header Fields:

* Customer
* OrderDate
* Notes

Details Grid:

* Item
* AvailableQuantity readonly
* RequestedQuantity
* UnitPrice
* LineTotal
* Notes
* Delete Row

مهم جدًا:

* لا تمنع حفظ الأوردر إذا RequestedQuantity أكبر من AvailableQuantity.
* اعرض Warning فقط.

مثال Warning:

"الكمية المطلوبة أكبر من المتاح حاليًا. سيظهر العجز في تقرير النواقص."

لكن زر Save يظل متاحًا.

عند الحفظ:

* Call POST /api/sales-orders.
* Status يكون Pending.
* لا يتم خصم مخزون.

---

## View Order Page

اعرض:

* OrderNumber
* Customer
* OrderDate
* Status
* Notes
* TotalAmount
* TotalCost
* TotalProfit

Items Grid:

* ItemName
* RequestedQuantity
* ApprovedQuantity
* UnitPrice
* UnitCost
* TotalCost
* Profit
* Notes

قبل الموافقة:

* UnitCost فارغ.
* TotalCost فارغ.
* Profit فارغ.
* ApprovedQuantity فارغة.

بعد الموافقة:

* تظهر كل القيم المحسوبة.

---

## Full Approval Flow

عند الضغط على Approve Full:

1. اعرض Confirmation Dialog:
   "هل تريد الموافقة الكاملة على الأوردر؟ سيتم خصم الكميات بالكامل من المخزون."

2. عند التأكيد:
   Call POST /api/sales-orders/{id}/approve

3. لو response success = true:

   * اعرض Toast نجاح.
   * حدث حالة الأوردر إلى Approved.
   * أعد تحميل البيانات.

4. لو response success = false وفيه shortages:

   * لا تغير الحالة في الواجهة.
   * افتح Dialog يعرض النواقص.

Shortages Dialog Columns:

* ItemName
* RequestedQuantity
* AvailableQuantity
* MissingQuantity

Actions:

* Close
* Open Shortage Report
* Create Purchase From Shortages

مهم:

إذا يوجد صنف واحد ناقص، الموافقة الكاملة لا تتم نهائيًا.

---

## Partial Approval Dialog

عند الضغط على Partial Approve:

افتح Dialog يحتوي على جدول:

* ItemName
* RequestedQuantity
* AvailableQuantity
* ApprovedQuantity input

Validation في الواجهة:

* ApprovedQuantity >= 0
* ApprovedQuantity <= RequestedQuantity
* ApprovedQuantity <= AvailableQuantity

Actions:

* Save
* Cancel

عند Save:

* Call POST /api/sales-orders/{id}/partial-approve
* بعد النجاح:

  * حالة الأوردر تصبح PartiallyApproved.
  * المخزون يتخصم بالكميات المعتمدة فقط.
  * الأرباح تظهر حسب الكميات المعتمدة فقط.

---

## Reject Order Flow

عند الضغط على Reject:

افتح Dialog:

* RejectionReason textarea

عند Save:

* Call POST /api/sales-orders/{id}/reject
* عند النجاح:

  * Status = Rejected
  * لا يتم خصم أي مخزون.

---

## Stock Shortages Report Page

صفحة تقرير النواقص.

API:

GET /api/reports/stock-shortages

Filters:

* FromDate
* ToDate
* Customer
* Item

Columns:

* ItemName
* UnitOfMeasure
* RequiredQuantity
* AvailableQuantity
* MissingQuantity
* AveragePurchasePrice
* EstimatedPurchaseCost

Actions:

* Refresh
* Export Excel
* Print
* Create Purchase From Shortages
* View Related Orders

Behavior:

* التقرير يعتمد على Pending Orders فقط.
* يعرض فقط الأصناف التي MissingQuantity > 0.
* عند الضغط على Create Purchase From Shortages:

  * افتح شاشة Create Purchase.
  * املأ الأصناف تلقائيًا بالكميات الناقصة.
  * المستخدم يختار Supplier ويضع الأسعار ثم يحفظ.

---

## Order Shortages

في صفحة View Order أو List:

زر View Shortages يستدعي:

GET /api/sales-orders/{id}/shortages

ويعرض Dialog:

* ItemName
* RequestedQuantity
* AvailableQuantity
* MissingQuantity

---

## Waste Page

### Waste List

Columns:

* WasteNumber
* WasteDate
* Employee
* Reason
* Actions

### Create Waste

Header:

* WasteDate
* EmployeeEntityId
* Reason
* Notes

Grid:

* Item
* AvailableQuantity readonly
* Quantity
* Delete Row

Behavior:

* هنا يجب منع Quantity أكبر من AvailableQuantity.
* عند Save:

  * Call POST /api/waste
  * backend يخصم المخزون.
  * اعرض Success Toast.

---

## Invoice Preview

نفذ صفحة أو Dialog لعرض فاتورة الأوردر.

Invoice تحتوي على:

* Company Name / Logo
* OrderNumber
* OrderDate
* CustomerName
* CustomerPhone
* CustomerAddress
* Items
* Quantity
* UnitPrice
* Total
* TotalAmount
* Notes

Actions:

* Print
* Download PDF
* Download Image
* Share via WhatsApp if possible

---

## Delivery Routes Page

Inputs:

* RouteDate
* Driver
* Start Location
* Orders to deliver

اعرض فقط الأوردرات:

* Approved
* PartiallyApproved
* Not Delivered

لكل أوردر يجب عرض:

* OrderNumber
* CustomerName
* Address
* WhatsAppNumber
* GoogleMapUrl

After Generate Route:

Columns:

* StopOrder
* OrderNumber
* CustomerName
* Address
* Phone
* GoogleMapLink
* Distance
* Duration

Actions:

* Open in Google Maps
* Copy Route Link
* Print Driver Sheet

---

## Dashboard

اعرض Cards:

* Pending Orders Count
* Approved Orders Today
* Total Sales Today
* Total Profit Today
* Low Stock Items Count
* Shortage Items Count
* Waste Today
* Purchases Today

اعرض Widgets:

* Top Selling Items
* Latest Orders
* Stock Shortages Summary
* Low Stock Summary

---

## Services

أنشئ Angular services:

* items.service.ts
* inventory.service.ts
* entities.service.ts
* purchases.service.ts
* sales-orders.service.ts
* reports.service.ts
* waste.service.ts
* invoices.service.ts
* delivery-routes.service.ts

كل Service مسؤول عن API calls فقط.

---

## Models

أنشئ interfaces لكل DTO:

* ItemDto
* InventoryDto
* EntityDto
* PurchaseOrderDto
* CreatePurchaseDto
* SalesOrderDto
* CreateSalesOrderDto
* SalesOrderItemDto
* ApproveOrderResultDto
* StockShortageDto
* StockShortageReportDto
* PartialApproveOrderDto
* WasteOrderDto
* DeliveryRouteDto

---

## UX Rules

* لا تمنع إنشاء الأوردر بسبب نقص المخزون.
* اعرض Warning فقط عند إدخال كمية أكبر من المتاح.
* الموافقة الكاملة إذا فشلت بسبب النواقص، اعرض النواقص بوضوح.
* الموافقة الجزئية تسمح باعتماد جزء من الكميات فقط.
* كل عمليات الحفظ تعرض loading state.
* كل errors من backend تعرض بشكل واضح.
* الجداول يجب أن تدعم search و pagination.
* استخدم Reactive Forms.
* استخدم typed forms قدر الإمكان.
* افصل Dialogs عن Pages.
* لا تكرر API logic داخل components.

---

## Important Business Rules في الواجهة

Create Order:

* Save allowed even if quantity > available stock.

Full Approve:

* If backend returns shortages, show shortages dialog.
* Do not update status locally unless backend returns success.

Partial Approve:

* ApprovedQuantity cannot exceed available stock.
* ApprovedQuantity cannot exceed requested quantity.

Waste:

* Quantity cannot exceed available stock.

Profit:

* لا يظهر profit قبل الموافقة.
* Profit يظهر بعد Approved أو PartiallyApproved فقط.

Shortage Report:

* يعتمد على Pending Orders فقط.
* يساعد المستخدم على إنشاء Purchase Order بالنواقص.
