# Pre-Production Review — GymReg

> Generated: 2026-05-25  
> Laravel 13.8 + Inertia.js 3 (React 19) + Tailwind CSS v4 + SQLite (dev)

## Test Results Summary

| Check | Status | Details |
|-------|--------|---------|
| PHP Unit Tests | ✅ 38/38 passed | 0 skipped (RegistrationTest removed — tested disabled Fortify feature) |
| PHP Version | ✅ 8.5.6 | meets `^8.3` requirement |
| npm Audit | ✅ 0 vulnerabilities | clean |
| Composer Dependencies | ✅ All up to date | direct deps current |
| npm Outdated | ⚠️ 17 packages behind | mostly minor/patch, see below |
| Registration Open Check on POST | ✅ Fixed | C3 — `store()` now checks `isRegistrationOpen()` |
| Capacity Validation on POST | ✅ Fixed | C4 — validates each slot against setting capacity |
| Capacity Consistency | ✅ Fixed | C5 — all references now use 40 (DB default + frontend) |
| Race Conditions on Slot Booking | ✅ Fixed | C6 — DB transactions with IMMEDIATE locking |
| Timezone | ✅ Fixed | H2 — set to Africa/Addis_Ababa |
| Rate Limiting on POST | ✅ Fixed | H3 — throttled 10 req/min |
| Inertia SSR | ✅ Fixed | H4 — disabled (no runtime) |
| TypeScript | ✅ 0 errors | M1 — `router.off` → unsubscribe pattern |
| ESLint | ❌ 63 errors | see below |
| Prettier | ❌ 18 files with issues | formatting |
| PHP Pint | ⚠️ Not runnable | `pint` command not found |

---

## 🔴 Critical (Fix Before Deploy)

### ~~C3 — Registration POST Bypasses Registration Window~~ ✅ Fixed
**File:** `app/Http/Controllers/Api/RegistrationController.php:39-43`

`store()` now checks `RegistrationSetting::current()->isRegistrationOpen()` at the top and returns a `closed` error if registration is not open.

### ~~C4 — No Capacity Validation on Registration Submit~~ ✅ Fixed
**File:** `app/Http/Controllers/Api/RegistrationController.php:55-65`

`store()` now iterates each selected slot, counts current occupancy with `whereJsonContains`, and rejects with `"The slot {day} {time} is full."` if at capacity from `RegistrationSetting::current()->capacity`.

### ~~C5 — Inconsistent Capacity: Frontend 40 vs Backend 45~~ ✅ Fixed
**Files:**
- `resources/js/pages/dashboard.tsx:84` — `MAX_CAPACITY` changed from `45` to `40`
- `database/migrations/2026_05_25_090456_add_capacity_to_registration_settings_table.php` — default changed from `45` to `40`
- `app/Http/Controllers/Api/RegistrationController.php:115` — `checkCapacity()` reads from `RegistrationSetting::current()->capacity` instead of hardcoded `45`

All frontend constants now use `40`. Backend reads from the `registration_settings.capacity` column (default `40`).

### ~~C6 — Race Conditions on Slot Booking~~ ✅ Fixed
**Files:** `app/Http/Controllers/Api/RegistrationController.php:58-95`, `config/database.php:44`

Slot creation is now wrapped in `DB::beginTransaction()` / `DB::commit()` with `DB::rollBack()` on failure, ensuring the capacity check and save are atomic. The SQLite connection uses `IMMEDIATE` transaction mode (changed from `DEFERRED`), which acquires the write lock at transaction start so concurrent requests are serialized.

---

## 🟠 High Priority

### H1 — Session Not Configured for HTTPS
**File:** `.env` / `config/session.php:172`

`SESSION_SECURE_COOKIE` is not set (null). In production, session cookies will be sent over unencrypted HTTP unless served behind a terminating proxy that sets `https` in the request.

**Fix:** Set `SESSION_SECURE_COOKIE=true` in production `.env`.

### ~~H2 — Timezone Mismatch (UTC vs Local)~~ ✅ Fixed
**File:** `config/app.php:68`

Timezone set to `Africa/Addis_Ababa` so `now()` checks match local operational hours.

### ~~H3 — No Rate Limiting on Registration POST~~ ✅ Fixed
**File:** `routes/web.php:39`

`POST /register-gym` now throttled to 10 requests/minute via `throttle:10,1` middleware.

### ~~H4 — Inertia SSR Enabled but No Runtime Installed~~ ✅ Fixed
**File:** `config/inertia.php:18-19`

SSR disabled (`'enabled' => false`) since no SSR runtime is installed.

### ~~H5 — 2 Skipped Tests~~ ✅ Fixed
**File:** `tests/Feature/Auth/RegistrationTest.php` — removed

Tests were skipped because `Features::registration()` is intentionally disabled (app uses custom `/register-gym` flow). Removed the file since it had no value.

---

## 🟡 Medium Priority

### ~~M1 — TypeScript Errors~~ ✅ Fixed
**File:** `resources/js/components/loading-screen.tsx:18-23`

Replaced `router.off("start", start)` / `router.off("finish", finish)` with the unsubscribe pattern: `const removeStart = router.on("start", start)` / `removeStart()` in the cleanup. Inertia v3's `router.on` returns an unsubscribe function, and `.off` does not exist on the type.

### M2 — 63 ESLint Errors
Includes:
- **Components created during render** (`SortIcon` in `RegistrationsIndex.tsx:172`) — breaks React state tracking
- **`setState` in useEffect** (`RegistrationsIndex.tsx:187`) — cascading re-renders
- **Unused imports** across multiple files (`Toaster`, `className`, `isMobile`, `LineChart`, `Users`, `Dumbbell`, etc.)
- **Import ordering** violations
- **Missing curly braces** on `if` statements
- **Missing blank lines** between statements
- **`no-case-declarations`** in switch statement
- **43 errors are auto-fixable** via `eslint --fix`; 20 require manual attention

Fix the `SortIcon` and `setState-in-effect` issues manually, then run `npm run lint -- --fix`.

### M3 — 18 Files Have Prettier Issues
Run `npm run format` to fix formatting.

### M4 — Overly Large Page Components
- `Registrations.tsx` — **879 lines**
- `RegistrationsIndex.tsx` — **762 lines**
- `dashboard.tsx` — **603 lines**

Extract reusable logic into custom hooks and split presentation into smaller components.

### M5 — GitHub CI Doesn't Run Full Quality Checks
**File:** `.github/workflows/tests.yml`

Only runs Pest. Does not run `ci:check` (which includes `lint:check`, `format:check`, `types:check` + tests). The `lint.yml` workflow runs lint+format but **mutates files in CI** (no `--check` flag on format, no `--test` on Pint).

**Fix:** Run `composer ci:check` in tests workflow; add `--check` flags in lint workflow.

### M6 — Registration `updateOrCreate` Silently Overwrites
**File:** `app/Http/Controllers/Api/RegistrationController.php:47-58`

Using `employee_id` as the match key means an existing employee re-registering silently overwrites all previous data (including already-assigned slots). No confirmation or warning.

**Fix:** Either return an error for duplicate employee_id, or merge slots instead of replacing.

### M7 — No Validation of Slot Values
**File:** `app/Http/Controllers/Api/RegistrationController.php`

`selectedSlots` is validated as `array|min:1|max:3` but individual slot objects are not validated for structure (must have `day` and `time` keys with valid values from the schedule).

**Fix:** Add nested validation for `selectedSlots.*.day` and `selectedSlots.*.time`.

---

## 🟢 Low Priority

### L1 — `APP_DEBUG=true` in Production .env
Remove from production or set to `false`.

### L2 — SQLite in Production
SQLite is fine for low-traffic, but MySQL/PostgreSQL is recommended for concurrent writes (especially with the race condition in C6).

### L3 — Missing Node Version Lock
No `.nvmrc` or `engines` field in `package.json`. Lock to Node 22 for consistent builds.

### L4 — npm Outdated Packages (17 packages behind)
| Package | Current | Latest |
|---------|---------|--------|
| `@inertiajs/react` | 3.1.1 | 3.2.0 |
| `@inertiajs/vite` | 3.1.1 | 3.2.0 |
| `@vitejs/plugin-react` | 5.2.0 | 6.0.2 |
| `eslint` | 9.39.4 | 10.4.0 |
| `lucide-react` | 0.475.0 | 1.16.0 |
| `vite` | 8.0.12 | 8.0.14 |

### L5 — `env` Helper Over `config()` in RegistrationController
**File:** `app/Http/Controllers/Api/RegistrationController.php` — not currently using env directly, but ensure all config is accessed via `config()` for caching.

---

## Action Plan (Recommended Order)

1. **~~🔴 C3+C4~~ ✅ Done** — Guard POST with registration-open + capacity checks
2. **~~🔴 C5~~ ✅ Done** — Unify capacity to 40 (DB default + frontend constants)
3. **~~🔴 C6~~ ✅ Done** — Add DB transactions with locking
4. **~~🟠 H2~~ ✅ Done** — Timezone set to Africa/Addis_Ababa
5. **~~🟠 H3~~ ✅ Done** — Rate limiting on POST /register-gym
6. **🟠 H1** — Session not configured for HTTPS
7. **~~🟠 H4~~ ✅ Done** — Disabled Inertia SSR
8. **~~🟠 H5~~ ✅ Done** — Removed skipped RegistrationTest
9. **~~🟡 M1~~ ✅ Done** — Fixed TypeScript errors (loading-screen unsubscribe)
10. **🟡 M2-M3** — Fix ESLint (63 errors), Prettier (18 files)
11. **🟡 M4-M7** — Refactor large components, CI improvements, validation
12. **🟢 L1-L5** — Polish
13. **Write domain-specific tests** for registration logic, capacity, admin access
