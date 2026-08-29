# Sportswear Inventory Manager

An automated sportswear inventory management workflow built with **n8n, Google Sheets, Groq Chat Model, and an AI Agent**.

I built this project to handle common inventory problems such as invalid product data, duplicate SKUs, missing optional values, and low-stock situations. The workflow validates incoming data before storing it and uses an AI Agent to generate reorder recommendations when stock becomes low.

## Main Features

- POST webhook for inventory input
- Required-field validation
- Price must be greater than 0
- Stock quantity cannot be negative
- Optional size handling with `N/A`
- Duplicate SKU detection
- Google Sheets inventory storage
- Low-stock detection at quantity <= 5
- AI Agent for reorder recommendations
- Separate `Reorder_Alerts` sheet
- Clear 400/409 response handling

## Tech Stack

| Technology | Purpose |
|---|---|
| n8n | Workflow automation |
| Google Sheets | Inventory and reorder alert storage |
| Groq Chat Model | LLM for the AI Agent |
| AI Agent | Low-stock analysis and reorder recommendations |
| Hoppscotch | Webhook/API testing |
| JSON | API payload and workflow export |

## Workflow Architecture

```text
Webhook
  ↓
Validation
  ├── Invalid → 400 Bad Request
  ↓
Low Stock Check
  ├── Stock <= 5 → AI Agent → Google Sheets Reorder Tool
  ↓
Prepare Inventory Data
  ↓
Search SKU in Google Sheets
  ↓
Duplicate SKU Check
  ├── Duplicate → 409 Conflict
  ↓
Append Product
  ↓
Success Response
```

### Complete n8n Workflow

![Complete n8n Workflow](screenshots/workflow-overview.png)

## Inventory Data

The workflow processes `item_name`, `sku`, `category`, `size`, `price`, `stock_quantity`, and `supplier`. It also stores a calculated stock status and timestamp. Size is optional and can be stored as `N/A` when missing.

## Testing & Edge Cases

### Existing SKU Test
The request using `TEST-VALID-001` was correctly identified as a duplicate and returned **409 Conflict**.

![Existing SKU](screenshots/duplicate-existing-sku.png)

### Low Stock / AI Test
A product with stock quantity `2` was used to exercise the low-stock AI path.

![Low Stock AI](screenshots/low-stock-ai-test.png)

### Negative Stock
A stock quantity of `-4` was rejected with **400 Bad Request**.

![Negative Stock](screenshots/negative-stock.png)

### Zero Price
A product with price `0` was rejected with **400 Bad Request**.

![Zero Price](screenshots/zero-price.png)

### Missing SKU
An empty SKU was rejected because SKU is required.

![Missing SKU](screenshots/missing-sku.png)

### Optional Size / Repeated SKU
The workflow supports missing size by storing `N/A`. This screenshot is from a later request using the same test SKU, so the repeated SKU is correctly returned as a duplicate.

![Optional Size Test](screenshots/optional-size-duplicate.png)

### Duplicate Product
Another request using `TEST-VALID-001` was correctly blocked with **409 Conflict**.

![Duplicate Product](screenshots/duplicate-product.png)

## AI Agent

The low-stock trigger is rule-based (`stock_quantity <= 5`). Once triggered, the AI Agent analyzes the situation, assigns urgency, recommends a reorder quantity, provides a short reason, and uses its connected Google Sheets tool to record the recommendation.

## Google Sheets Results

### Main Inventory Sheet
Validated inventory records are stored with item name, SKU, category, size, price, stock quantity, supplier, stock status, and timestamp. The sheet also demonstrates the `N/A` fallback for a missing size.

![Inventory Sheet](screenshots/inventory-sheet.png)

### AI Reorder Alerts
The `Reorder_Alerts` sheet stores AI-assisted low-stock decisions including SKU, item name, current stock, urgency, recommended reorder quantity, supplier, reason, and timestamp.

![Reorder Alerts](screenshots/reorder-alerts.png)

## Rule-Based Logic vs AI

Rule-based logic handles validation, price/stock rules, the low-stock threshold, duplicate detection, and HTTP responses. AI is reserved for the reorder recommendation, urgency classification, reason, and tool-assisted alert creation.

## Repository Structure

```text
sportswear-inventory-manager/
├── README.md
├── Sportswear-Inventory-Manager.json
├── Sportswear-Inventory-Manager-Report.pdf
└── screenshots/
    ├── workflow-overview.png
    ├── duplicate-existing-sku.png
    ├── low-stock-ai-test.png
    ├── negative-stock.png
    ├── zero-price.png
    ├── missing-sku.png
    ├── optional-size-duplicate.png
    ├── duplicate-product.png
    ├── inventory-sheet.png
    └── reorder-alerts.png
```

## How to Use

1. Import `Sportswear-Inventory-Manager.json` into n8n.
2. Configure your own Google Sheets credentials.
3. Configure your own Groq credentials.
4. Connect your Google Sheet.
5. Activate the workflow.
6. Send inventory data to your configured POST webhook.

> **Security:** API keys, OAuth tokens, passwords, and private credentials should never be committed to this repository. Configure your own credentials inside n8n.

## Future Improvements

Possible improvements include webhook authentication, supplier notifications, category-specific stock thresholds, inventory update/return operations, stronger SKU validation, audit logging, and reorder recommendations based on sales history.

## Assignment Report

[View Assignment Report](Sportswear-Inventory-Manager-Report.pdf)

## n8n Workflow

[View n8n Workflow JSON](Sportswear-Inventory-Manager.json)

## Author

**Daniyal Arqam**

Built as an n8n inventory automation project demonstrating validation, edge-case handling, Google Sheets integration, and practical AI Agent tool usage.
