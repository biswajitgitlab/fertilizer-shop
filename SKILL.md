# 🧬 SKILL: Sarkar Fertilizer & Agri-Tech AI Engineering Skill

> **Target Repository:** `fertilizer-shop` (`biswajitgitlab/fertilizer-shop`)  
> **Primary Technology Stack:** Laravel 11 (PHP 8.2+), React 18 (TypeScript + Vite), n8n Automation Workflows, MySQL 8.0, Redis 7.x, Razorpay API SDK.  
> **Purpose:** Comprehensive AI Agent Operational Guide, Architecture Map, Database Schema Reference, Concurrency Guidelines, and Developer Workflows for maintaining and expanding the Sarkar Fertilizer System.

---

## 🗺️ 1. Repository Anatomy & Directory Map

```
/fertilizer-shop
├── README.md                      # Primary project documentation & architecture overview
├── SKILL.md                       # AI Agent Instruction Set & Technical Reference (THIS FILE)
├── convert_seeder.py              # Seeder conversion utility script
├── fertilizer-api/                # Backend API (Laravel 11)
│   ├── app/
│   │   ├── Console/Commands/
│   │   │   └── ReconcilePendingPayments.php # Payment auto-reconciliation CLI
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php       # OTP & Sanctum Auth
│   │   │   ├── CartController.php       # Cart state & sync
│   │   │   ├── DiagnosisController.php  # Crop image diagnosis
│   │   │   ├── OrderController.php      # Order placement, locking & invoices
│   │   │   ├── ProductController.php    # Product catalog & stock queries
│   │   │   └── RazorpayController.php   # Payment orders, signatures & circuit breaker
│   │   ├── Models/                      # Eloquent Models (Product, Order, Payment, etc.)
│   │   └── Services/
│   │       └── PaymentCircuitBreaker.php # Redis-backed Circuit Breaker implementation
│   ├── database/
│   │   ├── migrations/                  # Schema definitions & indexes
│   │   └── seeders/                     # Initial catalog data
│   └── routes/
│       ├── api.php                      # REST API endpoints & Redis throttling
│       └── console.php                  # Scheduler definitions
├── fertilizer-web/                # Frontend Web Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/CartDrawer.tsx      # Cart drawer, free shipping bar, coupons
│   │   │   ├── checkout/PaymentModal.tsx # Razorpay & COD payment modal
│   │   │   ├── diagnosis/               # Visual AI diagnosis components
│   │   │   └── planner/                 # Smart Crop Planner & task scheduler
│   │   ├── pages/                       # Home, Products, Checkout, Admin, Planner
│   │   └── types.ts                     # TypeScript data interfaces
└── n8n-workflows/                 # Automation & AI Agent Blueprints
    ├── 1_chatbot.json                   # Agri-Agronomist conversational workflow
    ├── 2_diagnosis.json                 # Image pathology analysis pipeline
    ├── 3_order_notifications.json       # WhatsApp/SMS payment alert flow
    ├── 4_abandoned_cart.json            # Scheduled abandoned cart recoverer
    └── 5_fertilizer_reminders.json      # Farmer crop calendar alert dispatcher
```

---

## 🔒 2. Core Architectural Invariants & Rules

When modifying or generating code for this repository, **you MUST follow these strict rules**:

### Rule 1: Two-Tier Concurrency Locking (Inventory Safety)
- **NEVER** decrement product stock without acquiring both locks:
  1. **Tier-1 (Distributed Lock):** Acquire `Cache::lock("redis_inventory_lock_product_{$id}", 5)`. Block up to 2 seconds if contended.
  2. **Tier-2 (Pessimistic DB Lock):** Execute inside `DB::transaction()` using `Product::where('id', $id)->lockForUpdate()->first()`.
- Always log stock changes in the `inventory_logs` table (`InventoryLog::create([...])`).
- Always release all Redis locks in a `finally` block.

### Rule 2: Payment Gateway & Circuit Breaker Safety
- All Razorpay orders MUST pass through `PaymentCircuitBreaker` service (`/fertilizer-api/app/Services/PaymentCircuitBreaker.php`).
- If 3 payment failures occur within 60 seconds, the circuit TRIPS (`OPEN`).
- **Signature Verification:** Online payment confirmation MUST perform `hash_equals(hash_hmac('sha256', $orderId . '|' . $paymentId, $secret), $signature)`.
- Never trust client-reported status without server-side verification.

### Rule 3: Rate Limiting & Throttling
- The following Redis throttle keys are enforced in `routes/api.php` and MUST be preserved:
  - `throttle:auth` -> 6 requests / minute (Registration, OTP, Login).
  - `throttle:diagnosis` -> 5 requests / minute (AI Leaf Image Uploads).
  - `throttle:chat` -> 20 requests / minute (AI Agronomist Chatbot).

### Rule 4: Frontend Liquid Glass & Fallback Aesthetics
- Web pages MUST maintain the glassmorphic aesthetic (backdrop-blur, border glow, HSL tailored dark/light themes).
- **Zero Broken Images:** All product and diagnostic image tags MUST include `onError` fallback handlers pointing to verified local or stable Unsplash SVG/PNG assets.

---

## 📊 3. Database Schema & Data Models

### Key Tables & Relationships

```
                     ┌──────────────────┐
                     │      users       │
                     └────────┬─────────┘
                              │ 1:N
             ┌────────────────┼────────────────┐
             │ 1:N            │ 1:N            │ 1:N
             ▼                ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │    orders    │ │    carts     │ │ crop_diagn...│
     └───────┬──────┘ └──────────────┘ └──────────────┘
             │ 1:N
     ┌───────┴──────┐
     │  order_items │
     └───────┬──────┘
             │ N:1
             ▼
     ┌──────────────┐
     │   products   │
     └──────────────┘
```

#### `products`
- `id` (PK), `name`, `slug`, `category_id` (FK), `description`, `price` (decimal 10,2), `discount_price` (decimal 10,2), `stock_qty` (integer), `sku`, `unit` (kg/L/bag), `image_url`, `is_featured` (boolean).

#### `orders`
- `id` (PK), `user_id` (FK), `order_number` (string unique), `status` (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`), `subtotal`, `discount`, `tax`, `shipping_cost`, `total`, `payment_method` (`COD`, `ONLINE`), `payment_status` (`PENDING`, `PAID`, `FAILED`), `shipping_address_json`, `billing_address_json`, `tracking_number`.

#### `payments`
- `id` (PK), `order_id` (FK), `gateway` (`RAZORPAY`, `CASH_ON_DELIVERY`, `AUTO_RECONCILE`), `transaction_id`, `amount`, `status` (`PENDING`, `SUCCESS`, `FAILED`, `PENDING_COD`), `response_json`.

#### `inventory_logs`
- `id` (PK), `product_id` (FK), `type` (`SALE`, `RESTOCK`, `ADJUSTMENT`), `qty` (signed int), `reason` (string), `admin_id` (FK).

#### `coupons`
- `id` (PK), `code` (string unique), `type` (`FIXED`, `PERCENT`), `value` (decimal), `min_order` (decimal), `expires_at` (datetime), `is_active` (boolean).

---

## ⚡ 4. API Endpoints & Route Reference

### Public Routes
- `GET /api/products` — Product listing with category filters and pagination.
- `GET /api/products/{slug}` — Product detailed view.
- `GET /api/categories` — Category catalog list.
- `GET /api/coupons/public` — Active discount tokens for Cart Drawer quick-apply.
- `POST /api/chat/message` — AI Agronomist chatbot endpoint (Throttled: 20 req/min).

### Authenticated Customer Routes (`auth:sanctum`)
- `GET /api/cart` / `POST /api/cart/add` / `DELETE /api/cart/remove/{id}` — DB Cart operations.
- `POST /api/cart/apply-coupon` — Coupon discount validator.
- `POST /api/orders` — High-concurrency transaction order placement.
- `GET /api/orders/{id}` — Order details.
- `POST /api/orders/{id}/verify-payment` — HMAC Razorpay signature verification.
- `POST /api/orders/{id}/switch-cod` — Fallback to Cash on Delivery.
- `POST /api/diagnose` — Upload crop pathology image (Throttled: 5 req/min).
- `GET /api/planner` / `POST /api/planner` — Crop scheduler calendar management.

### Admin Routes (`auth:sanctum`, `role:Admin`)
- `GET /api/admin/dashboard` — Platform revenue & order metrics.
- `GET /api/admin/inventory` — Stock management overview.
- `GET /api/admin/inventory/{id}/logs` — Audit log trail for stock movements.
- `GET /api/payment-gateway/status` — Circuit breaker health check.
- `POST /api/admin/payment-gateway/reset-circuit` — Manual circuit breaker reset.

---

## 🧪 5. Testing & CLI Command Shortcuts

### Concurrency & Order Checkout Testing
To verify the two-tier locking logic under high concurrency:
```bash
cd fertilizer-api
php artisan test --filter=OrderConcurrencyTest
```

### Run Payment Reconciliation Command
To test background order reconciliation:
```bash
cd fertilizer-api
php artisan orders:reconcile-payments
```

### Circuit Breaker Diagnostics
To check or reset the Razorpay circuit breaker state:
```bash
# Check circuit state
curl -X GET http://localhost:8000/api/payment-gateway/status

# Reset circuit manually
curl -X POST http://localhost:8000/api/admin/payment-gateway/reset-circuit \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Database Refresh & Clean Seeding
To reset the database and load clean agricultural demo data:
```bash
cd fertilizer-api
php artisan migrate:fresh --seed
```

---

## 🛠️ 6. Guidelines for AI Agents Operating on this Codebase

1. **Do Not Bypass Redis Locks:** When creating custom endpoints that alter inventory, ALWAYS wrap the execution in Tier-1 Redis Locks and Tier-2 MySQL row locks.
2. **Maintain Type Safety:** When editing frontend React code in `/fertilizer-web`, update `/fertilizer-web/src/types.ts` whenever API response structures change.
3. **Preserve UI Aesthetics:** Check design tokens in `/fertilizer-web/src/index.css`. Use backdrop filters (`backdrop-blur-md`), dark slate glass cards (`bg-slate-900/80 border border-slate-800`), and smooth hover scaling.
4. **n8n Webhook Safety:** If editing `/fertilizer-api/app/Http/Controllers/Webhook/N8nWebhookController.php`, ensure return signatures respond with HTTP 200 OK within 5 seconds to prevent n8n execution timeouts.

---

<p align="center">
  <b>Sarkar Fertilizer Skill Specification</b> • Antigravity AI Engineering Standard
</p>
