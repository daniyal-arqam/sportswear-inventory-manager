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

The workflow receives inventory data through a webhook, validates the input, checks the stock level, handles low-stock items using an AI Agent, checks for duplicate SKUs, and finally stores valid products in Google Sheets.

```

### Complete n8n Workflow

![Complete n8n Workflow](ScreenShots/Screenshot%202026-08-29%20225839.png)

---

## Testing & Edge Cases

I tested the workflow with different inventory scenarios to verify validation, duplicate detection, low-stock handling, and AI-based reorder logic.

### Existing SKU Test

The request using `TEST-VALID-001` was correctly identified as a duplicate and returned **409 Conflict**.

![Existing SKU Test](ScreenShots/Screenshot%202026-08-29%20225911.png)

---

### Low Stock / AI Test

A product with a stock quantity of `2` was sent through the workflow to trigger the low-stock AI path.

![Low Stock AI Test](ScreenShots/Screenshot%202026-08-29%20225926.png)

---

### Negative Stock Test

A product with a stock quantity of `-4` was correctly rejected with **400 Bad Request**.

![Negative Stock Test](ScreenShots/Screenshot%202026-08-29%20225937.png)

---

### Zero Price Test

A product with a price of `0` was correctly rejected with **400 Bad Request**.

![Zero Price Test](ScreenShots/Screenshot%202026-08-29%20225947.png)

---

### Missing SKU Test

A request with an empty SKU was rejected with **400 Bad Request** because SKU is a required field.

![Missing SKU Test](ScreenShots/Screenshot%202026-08-29%20225957.png)

---

### Optional Size / Repeated SKU Test

The `size` field is optional in the workflow. When it is missing, the stored inventory record uses `N/A`.

This screenshot is from a later request using the same SKU, so the workflow correctly detects it as an existing SKU and returns **409 Conflict**.

![Optional Size Test](ScreenShots/Screenshot%202026-08-29%20230007.png)

---

### Duplicate Product Test

Another product request using the already stored SKU `TEST-VALID-001` was correctly blocked and returned **409 Conflict**.

![Duplicate Product Test](ScreenShots/Screenshot%202026-08-29%20230018.png)

---

## Google Sheets Results

### Main Inventory Sheet

After successful validation, inventory records are stored in Google Sheets.

The sheet contains:

- Item Name
- SKU
- Category
- Size
- Price
- Stock Quantity
- Supplier
- Stock Status
- Timestamp

The sheet also demonstrates that a missing optional size is stored as `N/A`.

![Main Inventory Sheet](ScreenShots/Screenshot%202026-08-29%20230151.png)

---

### AI Reorder Alerts

When stock is low, the AI Agent analyzes the product and creates a reorder recommendation using its connected Google Sheets tool.

The `Reorder_Alerts` sheet contains:

- SKU
- Item Name
- Current Stock
- Urgency
- Recommended Reorder Quantity
- Supplier
- Reason
- Timestamp

![AI Reorder Alerts](ScreenShots/Screenshot%202026-08-29%20230212.png)

---

## AI Agent Logic

The low-stock condition is handled using a rule:

`stock_quantity <= 5`

When this condition is true, the AI Agent is triggered. The agent analyzes the low-stock product, determines its urgency, recommends a reorder quantity, provides a reason, and records the recommendation in the `Reorder_Alerts` Google Sheet.

This approach keeps validation and duplicate checking predictable while using AI for a useful inventory decision.
## AI Agent

The low-stock trigger is rule-based (`stock_quantity <= 5`). Once triggered, the AI Agent analyzes the situation, assigns urgency, recommends a reorder quantity, provides a short reason, and uses its connected Google Sheets tool to record the recommendation.

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

[View Assignment Report](Sportswear%20Inventory%20Manager%20Final%20Report.pdf)

## n8n Workflow

[View n8n Workflow JSON](Sportswear%20Inventory%20Manager.json)

## Author

**Daniyal Arqam**

Built as an n8n inventory automation project demonstrating validation, edge-case handling, Google Sheets integration, and practical AI Agent tool usage.
