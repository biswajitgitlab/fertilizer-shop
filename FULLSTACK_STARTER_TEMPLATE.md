# 🚀 Universal Full-Stack Boilerplate & Starter Template

This repository is structured as a **Reusable, Production-Ready Full-Stack Starter Template** (Laravel API + React Vite SPA). You can use this exact architecture to quickly build any web application—such as a **Hospital Management System**, **Clinic Portal**, **School/ERP Software**, **E-Commerce Platform**, or **SaaS Dashboard**.

---

## 🏛️ Template Architecture Breakdown

### 1. Backend (`fertilizer-api` / `api-core`) — Laravel 13 API
* **Authentication & Security:** Laravel Sanctum token auth with stateful/stateless support.
* **Token Expiration:** Configured 24-hour token expiration (`sanctum.php`).
* **Role-Based Scope & Access Control (RBSC / RBAC):** Granular permissions for Super Admin, Staff, Doctors/Managers, and Customers/Patients.
* **Concurrency & Race Condition Guard:** Redis distributed locks (`Cache::lock()`) for duplicate prevention.
* **Validation Engine:** Controller `$request->validate()` with standardized JSON 422 validation response format.
* **Payment & Webhooks:** Modular payment service interfaces (Razorpay / Stripe) and webhook signature verification.

### 2. Frontend (`fertilizer-web` / `web-core`) — React 19 + Vite + TypeScript + Tailwind
* **Design Language:** Modern **Liquid Glass & Organic Aesthetics** with dark/light mode toggle.
* **Error & Security Pages:** Dedicated animated pages for:
  * `401` Unauthorized (Session Expired / Log In Required)
  * `403` Forbidden (Restricted Area / Missing Permission)
  * `422` Unprocessable Entity (Validation & Data Error Breakdown with Copy Info)
  * `404` Not Found (Route lost with quick links)
* **Auto-Logout Engine:**
  * **24-Hour Token Expiration Check:** Invalidates stored sessions on boot if >24 hours old.
  * **15-Minute Idle Inactivity Timer:** Listens to user interactions (`mousemove`, `click`, `keypress`, `touch`) and automatically logs out inactive users.
* **API Communication:** Pre-configured Axios interceptors with automatic `401`/`429`/`422` error handling and toast notifications (`react-hot-toast`).

---

## 🏥 Example: Transforming to a Hospital / Clinic App

To adapt this codebase into a **Hospital Management System**:

### Step 1: Data Models & Database Migrations
* Change `User` roles to: `Admin`, `Doctor`, `Nurse`, `Receptionist`, `Patient`.
* Replace `products` table with `medical_services`, `doctors`, `appointments`, `prescriptions`, and `patient_records`.

### Step 2: RBSC Permissions Setup
Define permissions in backend migrations / seeders:
* `appointments.create`, `appointments.view`, `appointments.manage`
* `prescriptions.write`, `prescriptions.view`
* `patient_records.view_sensitive`, `billing.manage`

### Step 3: Frontend Routes & Components
* Map `/appointments` for Patient booking.
* Map `/admin/patients`, `/admin/doctors`, `/admin/prescriptions` wrapped in `<ProtectedRoute requiredPermission="...">`.
* All built-in features (401/403/422/404 error pages, liquid glass cards, dark mode, toast notifications, idle auto-logout) work out of the box without any refactoring!

---

## 🛠️ How to Clone & Spin Up a New Application

1. **Copy Workspace Structure:**
   ```bash
   cp -r fertilizer-shop my-new-app
   cd my-new-app
   ```

2. **Update Environment Files:**
   * Edit `fertilizer-api/.env` (DB_DATABASE=my_new_app_db, APP_NAME="Hospital App")
   * Edit `fertilizer-web/.env` (VITE_APP_TITLE="Hospital Management System")

3. **Start Backend & Frontend:**
   * Backend: `cd fertilizer-api && php artisan serve --port=8000`
   * Frontend: `cd fertilizer-web && npm run dev`

---

## 💡 Pre-built Core Components Included
* `<ProtectedRoute />` — Role & RBSC Permission Guard.
* `<IdleTimer />` — 15-minute inactivity tracker.
* `<Unauthorized />` (`/401`) — Animated login prompt.
* `<Forbidden />` (`/403`) — Access denied & role inspector.
* `<Unprocessable />` (`/422`) — Form error breakdown.
* `<NotFound />` (`/404`) — Route lost navigator.
