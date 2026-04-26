# Venuva Frontend — Comprehensive Rewire Plan

## Overview

Three roles: **Admin**, **Organizer**, **Attendee**. Wire the entire frontend to the real backend API at `http://localhost:8089/api`. Add notification bell, enforce role-based permissions, add organizer routes, and fix all existing flaws.

---

## PART 1: API Layer — Rewire to Real Backend Endpoints

Every API file currently either hits wrong endpoints or has placeholder/mock logic. Each must be rewritten to match the APIDocs exactly.

### 1.1 — `src/utils/config.js`

**Current**: Default port is `5000`.
**Change**: Default to `http://localhost:8089/api` to match the backend.

```
apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8089/api'
```

### 1.2 — `src/utils/api/authApi.js`

**Current**: Has hardcoded test credentials (admin@test.com, user@test.com). Login returns `{ user, token }` but real API returns `{ Id, email, role, token }` (no `user` wrapper, no `name` field). Register calls `/auth/register` but expects `{ user, token }` wrapper. Logout calls `/auth/logout` which doesn't exist in API.

**Changes**:
- Remove all test credential overrides
- `login(credentials)` → `POST /api/auth/login` with `{ email, password }`. Map response: `{ Id, email, role, token }` → `{ user: { id: Id, email, role }, token }`
- `register(data)` → `POST /api/auth/register` with `{ username, email, password }`. Note: API field is `username` not `name`. Map response same as login.
- `registerOrganizer(data)` → `POST /api/auth/register/organizer` with `{ username, email, password }`. Admin-only. Map response same.
- `getMe()` → `GET /api/auth/me`. Returns `{ Id, email, role, token }`.
- `checkEmail(email)` → `GET /api/auth/check-email?email={email}`. Returns boolean.
- Remove `logout()` — there is no server-side logout endpoint; logout is client-side only (clear localStorage).

**Key API mismatch**: The backend uses `ROLE_ATTENDEE`, `ROLE_ORGANIZER`, `ROLE_ADMIN` for roles. Frontend currently uses `admin`, `attendee`. We need a role mapping utility:
- `ROLE_ADMIN` → `admin`
- `ROLE_ORGANIZER` → `organizer`
- `ROLE_ATTENDEE` → `attendee`

The backend also returns `Id` (capital I) not `id`. Normalize in the API layer.

### 1.3 — `src/utils/api/eventsApi.js`

**Current**: Has endpoints that don't match the API docs. `registerForEvent` hits `/events/{id}/register` but the real endpoint is `POST /api/registrations/register` with `{ userId, eventId }`. `getEventRegistrations` hits `/events/{id}/registrations` which doesn't exist.

**Changes**:
- `getEvents()` → `GET /api/events` (AUTHENTICATED). Returns array of event objects. Note: response fields are `location` (not `venue`), `maxAttendance` (not `capacity`), no `registered` field, has `organizerId`, `organizerName`, `categoryId`, `categoryName`, `eventStatus`, `paymentRequired`.
- `getEventById(id)` → `GET /api/events/{id}` (AUTHENTICATED). Same shape + `description`.
- `createEvent(data)` → `POST /api/events` (ORGANIZER/ADMIN). Body: `{ title, description, date, location, maxAttendance, eventStatus, paymentRequired, price, organizerId, categoryId }`. Returns event ID (201).
- `updateEvent(id, data)` → `PUT /api/events/{id}` (ORGANIZER/ADMIN). Partial update — only send changed fields. Returns `true` (200).
- `deleteEvent(id)` → `DELETE /api/events/{id}` (ADMIN only). Returns `true` (200).
- Remove `registerForEvent` and `getEventRegistrations` — these belong in different API files.

**Field mapping needed across frontend** (event object):
| Frontend (current) | Backend (real) | Action |
|---|---|---|
| `venue` | `location` | Rename throughout |
| `capacity` | `maxAttendance` | Rename throughout |
| `registered` | — (not in response) | Must get from registrations count endpoint |
| `price` | `price` | Same (but 0 means free, check `paymentRequired` boolean) |
| `image` | — (not in API) | Remove from forms/schemas, use placeholder |
| — | `eventStatus` | Add (SCHEDULED/COMPLETED/CANCELED) |
| — | `paymentRequired` | Add (boolean) |
| — | `organizerId` / `organizerName` | Add |
| — | `categoryId` / `categoryName` | Add |

### 1.4 — `src/utils/api/bookingApi.js` → Rename to `registrationApi.js`

**Current**: Hits fake endpoints `/bookings/my-registrations` and `/bookings/my-payments` which don't exist.

**Changes** (rename to `registrationApi.js`):
- `registerForEvent(userId, eventId)` → `POST /api/registrations/register` with `{ userId, eventId }`. Returns 201. Note: this replaces the misplaced `eventsApi.registerForEvent`.
- `getUserRegistrations(userId)` → `GET /api/registrations/{userId}` (ATTENDEE/ADMIN). Returns array of `{ registrationId, userId, eventId, eventTitle, eventDate, eventLocation, paymentRequired, status }`.
- `cancelRegistration(userId, eventId)` → `DELETE /api/registrations/cancel` with body `{ userId, eventId }`. Returns `{ message }`.
- `getTotalRegistrations()` → `GET /api/registrations/getNumberOfRegesters` (ADMIN). Returns number.
- `getEventRegistrationCount(eventId)` → `GET /api/registrations/getNumberOfRegestersForEvent/{eventId}` (ADMIN/ORGANIZER). Returns number.
- `getTotalSpent(userId)` → `GET /api/registrations/getTotalSpents/{userId}` (ATTENDEE). Returns BigDecimal.

### 1.5 — `src/utils/api/paymentApi.js`

**Current**: Hits `/payments/initiate` with `{ eventId, tickets }` — wrong endpoint. Real API uses query params.

**Changes**:
- `initiatePayment(amountCents, userId, eventId)` → `POST /api/payments/pay?amountCents={n}&userId={n}&eventId={n}`. No body. Returns iframe URL string (not an object).
- Remove `getPaymentStatus` — there's no such endpoint. Payment status comes from the callback.
- Note: `amountCents` is the price in EGP × 100 (the API multiplies by 100 again internally, so pass the event price × 100).

### 1.6 — `src/utils/api/organizerApi.js`

**Current**: Hits `/organizers` CRUD — but no such endpoints exist in the API! The only organizer-related endpoint is `POST /api/auth/register/organizer` (admin creates organizer account).

**Changes**: The API has **no organizer CRUD endpoints** — organizers are just users with `ROLE_ORGANIZER`. The admin creates them via the auth register endpoint.

- Remove `getOrganizers`, `updateOrganizer`, `deleteOrganizer` — these don't exist.
- Keep only: `createOrganizer(data)` which calls `authApi.registerOrganizer(data)` internally.
- For listing organizers in admin panel: There's no endpoint for this. We need to note this as a **backend gap**. Options: (a) call `GET /api/events` and extract unique organizer names, or (b) add the endpoint to the backend, or (c) remove the organizer listing page and just have the create form.

### 1.7 — `src/utils/api/adminApi.js`

**Current**: Hits `/admin/stats` which doesn't exist.

**Changes**: There is no admin stats endpoint. Build stats from available data:
- Total events → `GET /api/events` → count array length
- Total registrations → `GET /api/registrations/getNumberOfRegesters`
- Total revenue → not available via API. Could sum event prices × registration counts, or note as backend gap.

### 1.8 — `src/utils/api/notificationApi.js` (NEW)

**Create this file** for the notification system:
- `getUserNotifications(userId)` → `GET /api/notifications/{userId}` (AUTHENTICATED). Returns array of `{ notifId, message, date, userId, userName, read }`.
- `markAsRead(notifId)` → `PUT /api/notifications/mark-read/{notifId}` (AUTHENTICATED). Returns updated notification object.

### 1.9 — `src/utils/api/categoryApi.js` (NEW)

**Create this file** for categories (used in event creation form):
- `getCategories()` → `GET /api/categories` (AUTHENTICATED). Returns array of `{ id, name }`.
- `getCategoryById(id)` → `GET /api/categories/{id}` (AUTHENTICATED).
- `createCategory(data)` → `POST /api/categories` with `{ name }` (ADMIN).
- `updateCategory(id, data)` → `PUT /api/categories/{id}` with `{ name }` (ADMIN).
- `deleteCategory(id)` → `DELETE /api/categories/{id}` (ADMIN).

---

## PART 2: Auth & Role System

### 2.1 — `src/context/AuthContext.jsx`

**Current issues**:
- `signup` accepts `(data)` but AuthPage calls `signup(data.name, data.email, data.password)` with positional args. Mismatch.
- Stores `user.name` but API returns `email` only (no name field). The backend has `username`.
- No role normalization.

**Changes**:
- Add role normalization helper: `ROLE_ADMIN`→`admin`, `ROLE_ORGANIZER`→`organizer`, `ROLE_ATTENDEE`→`attendee`.
- In `login`: Map API response `{ Id, email, role, token }` → `{ user: { id, email, role (normalized), username }, token }`. Store `username` as the display name.
- In `signup`: Accept `(data)` object `{ username, email, password }`. Send to `authApi.register`. Map response same way.
- Fix signup in AuthPage to pass an object, not positional args. Also note: the API uses `username` not `name`, so the signup form field should map `name` → `username`.

### 2.2 — `src/components/ProtectedRoute.jsx`

**Current**: Only checks `admin` role. Doesn't handle `organizer`.

**Changes**:
- Support `requiredRole` as string OR array: `requiredRole="admin"` or `requiredRole={["admin", "organizer"]}`.
- When role doesn't match, redirect to the appropriate dashboard:
  - `admin` → `/admin/dashboard`
  - `organizer` → `/organizer/dashboard`
  - `attendee` → `/dashboard`

### 2.3 — `src/App.jsx` — Route Structure

**Current**: Has public routes, attendee routes (no role check), and admin routes. Missing organizer routes entirely. Attendee routes don't have `requiredRole` so any logged-in user can access them.

**New route structure**:
```
/auth                          → AuthPage (public, no layout)

AUTHENTICATED (any role, with Layout):
  /                            → LandingPage
  /events                     → EventsPage
  /events/:id                 → EventDetailsPage

ATTENDEE routes (with Layout):
  /dashboard                  → DashboardPage (attendee)
  /register                   → RegisterPage
  /payment                    → PaymentPage
  /result                     → ResultPage

ORGANIZER routes (with Layout):
  /organizer/dashboard        → OrganizerDashboardPage (NEW)
  /organizer/events           → OrganizerEventsPage (NEW)

ADMIN routes (with Layout):
  /admin/dashboard            → AdminDashboardPage
  /admin/events               → AdminEventsPage
  /admin/organizers           → AdminOrganizersPage
  /admin/categories           → AdminCategoriesPage (NEW)

Fallback: → /auth
```

**Important role rules from requirements**:
- Admin can create organizers but NOT events
- Organizer can create events but NOT organizers
- Attendee browses, registers, pays

---

## PART 3: Organizer Role — New Pages

### 3.1 — `src/pages/organizer/OrganizerDashboardPage.jsx` (NEW)

Organizer's home page showing:
- Stats: number of events they organize, total registrations across their events
- Recent events list (their events only)
- Quick link to create event

Data source: `GET /api/events` filtered by `organizerId === user.id`, plus `GET /api/registrations/getNumberOfRegestersForEvent/{eventId}` for each.

### 3.2 — `src/pages/organizer/OrganizerEventsPage.jsx` (NEW)

Organizer event management:
- List their events (filter `GET /api/events` by `organizerId`)
- Create event form: maps to `POST /api/events` with all required fields (title, description, date, location, maxAttendance, eventStatus, paymentRequired, price, organizerId=self, categoryId). Need category dropdown from `GET /api/categories`.
- Edit event: `PUT /api/events/{id}` — partial update
- **Cannot delete events** — that's admin-only per API (DELETE returns 403 for non-admin)
- Show registration count per event via `GET /api/registrations/getNumberOfRegestersForEvent/{eventId}`

---

## PART 4: Admin Pages — Fix & Rewire

### 4.1 — `src/pages/admin/AdminDashboardPage.jsx`

**Current issues**: Calls `adminApi.getDashboardStats()` which doesn't exist. Uses `event.registered` and `event.capacity` which are wrong field names.

**Changes**:
- Compute stats from real endpoints:
  - Total Events: fetch `GET /api/events`, count length
  - Total Registrations: `GET /api/registrations/getNumberOfRegesters`
  - Total Revenue: not directly available — note this as backend gap, or compute from events data
- Recent events table: use response fields `location` (not `venue`), `maxAttendance` (not `capacity`), `eventStatus` for status display
- Remove hardcoded fallback data

### 4.2 — `src/pages/admin/AdminEventsPage.jsx`

**Current issues**: Event form has wrong fields (venue→location, capacity→maxAttendance, image doesn't exist in API). Missing required fields: `eventStatus`, `paymentRequired`, `organizerId`, `categoryId`. Create/edit buttons work (dialog exists) but form doesn't match API.

**Changes**:
- Remove admin's ability to create events (requirement: admin creates organizers, NOT events). Remove the "Create Event" button entirely. Admin can only view, edit status, and delete events.
- Update event form for edit mode: add `eventStatus` dropdown (SCHEDULED/COMPLETED/CANCELED), `paymentRequired` toggle, `categoryId` dropdown (fetch categories). Remove `image` field.
- Rename all field references: `venue`→`location`, `capacity`→`maxAttendance`
- Table columns: show `organizerName`, `categoryName`, `eventStatus`
- For registration count: need to call `GET /api/registrations/getNumberOfRegestersForEvent/{eventId}` per event (or accept N+1 here for simplicity)

### 4.3 — `src/pages/admin/AdminOrganizersPage.jsx`

**Current issues**: Calls `organizerApi.getOrganizers()` which doesn't exist. The CRUD dialogs call non-existent endpoints.

**Changes**:
- The "Create Organizer" form must call `POST /api/auth/register/organizer` with `{ username, email, password }`. This is the only organizer-related endpoint.
- Listing organizers: **Backend gap** — no endpoint. Options:
  - Option A: Extract unique organizers from `GET /api/events` (gets `organizerId` + `organizerName` pairs). Limited — only shows organizers who have events.
  - Option B: Leave as is and note that a `GET /api/users?role=ORGANIZER` endpoint is needed from backend.
  - **Recommended**: Use Option A as a temporary measure + the create form. The create dialog should have just 3 fields: username, email, password (matching the API).
- Remove edit/delete organizer functionality — no API endpoints for it.
- Remove phone/bio/website fields from the form — the API only accepts `{ username, email, password }`.

### 4.4 — `src/pages/admin/AdminCategoriesPage.jsx` (NEW)

Admin can manage event categories:
- List all: `GET /api/categories`
- Create: `POST /api/categories` with `{ name }`
- Edit: `PUT /api/categories/{id}` with `{ name }`
- Delete: `DELETE /api/categories/{id}` (note: cascades to events!)
- Simple table with name column + actions

---

## PART 5: Attendee Pages — Fix & Rewire

### 5.1 — `src/pages/EventsPage.jsx`

**Current issues**: Passes params like `search`, `sortBy`, `price` to `getEvents()` but the API doesn't support query params — it returns all events. Filtering/sorting must be client-side. Uses `event.venue` (should be `event.location`).

**Changes**:
- Fetch all events once with `GET /api/events`. Apply search, sort, price filter, and pagination in the frontend.
- Map field names in display: `location` not `venue`.
- For price filter: use `paymentRequired` boolean and `price` field.
- Handle `eventStatus`: only show `SCHEDULED` events to attendees (hide COMPLETED/CANCELED).

### 5.2 — `src/pages/EventDetailsPage.jsx`

**Current issues**: Uses `event.venue`, `event.capacity`, `event.registered`, `event.price === 0` for free check. Real API has `location`, `maxAttendance`, no `registered` count, and uses `paymentRequired` boolean.

**Changes**:
- Fetch event: `GET /api/events/{id}`
- Fetch registration count: `GET /api/registrations/getNumberOfRegestersForEvent/{id}` (this is ADMIN/ORGANIZER only — **potential issue**: attendees may not have access to this. Need to verify, or display without count).
- Map fields: `location`, `maxAttendance`, `paymentRequired` instead of `price === 0`
- Free event registration: call `POST /api/registrations/register` with `{ userId: user.id, eventId }`. No tickets count — the API registers one user, not multiple tickets.
- Replace `window.confirm` with AlertDialog (consistent with RegisterButton)
- Show event description from `event.description` (currently hardcoded text)

### 5.3 — `src/pages/RegisterPage.jsx`

**Current issues**: Multi-ticket registration, but the API only supports 1 registration per user per event (no ticket quantity). Uses `event.price` for pricing, but should check `paymentRequired`.

**Changes**:
- Remove multi-ticket logic (the API registers 1 user to 1 event, no quantity).
- Show a simple "Review Registration" step instead:
  - Step 1: Confirm details (event, user info)
  - Step 2: If `paymentRequired`, proceed to payment. If not, register directly.
- For paid events: navigate to `/payment` with event in context
- For free events: call `POST /api/registrations/register` directly, then navigate to dashboard.
- Map fields: `location` not `venue`, `maxAttendance` not `capacity`.

### 5.4 — `src/pages/PaymentPage.jsx`

**Current issues**: Calls `paymentApi.initiatePayment({ eventId, tickets })` but real API uses query params `?amountCents={n}&userId={n}&eventId={n}`. Uses `selectedEvent.tickets` which is multi-ticket (removing). Uses `toast` without import (actually it does import it on line 3).

**Changes**:
- Call: `POST /api/payments/pay?amountCents={price*100}&userId={user.id}&eventId={event.id}`. No body.
- Response is a plain URL string (not `{ iframeUrl }`). Set `iframeUrl` directly from response.
- Remove tickets × price calculation. Show single ticket price.
- Get `user.id` from AuthContext.
- After payment completes (via postMessage from iframe), the backend callback automatically registers the user. Frontend just navigates to `/result`.

### 5.5 — `src/pages/DashboardPage.jsx`

**Current issues**: Uses `useRegistrations` hook which has hardcoded mock data. Calls `bookingApi.getPaymentHistory()` which hits non-existent endpoint. Uses `user.name` but API returns `username`.

**Changes**:
- My Tickets tab: `GET /api/registrations/{userId}` → show registrations. Fields: `eventTitle`, `eventDate`, `eventLocation`, `status`, `paymentRequired`.
- Remove `useRegistrations` hook — fetch directly in component or replace hook internals.
- Total Spent: `GET /api/registrations/getTotalSpents/{userId}` (single number).
- Remove payment history tab or simplify — there's no payment history endpoint. Show registrations with their `status` instead (PENDING, PAID, CONFIRMED, etc.).
- Profile settings: display `user.username` and `user.email`. Note: there's no profile update endpoint in the API, so the "Update Name" button should be disabled or removed.

### 5.6 — `src/components/RegisterButton.jsx`

**Current issues**: Calls `eventsApi.registerForEvent(event.id, { tickets: 1 })` — wrong endpoint. Uses `window.location.pathname` for redirect state in HashRouter (always `/`).

**Changes**:
- Free registration: call `registrationApi.registerForEvent(user.id, event.id)` → `POST /api/registrations/register` with `{ userId, eventId }`.
- Fix redirect state: use `window.location.hash.slice(1)` or hardcode the event path.
- Check `event.paymentRequired` instead of `event.price === 0` for free/paid determination.

---

## PART 6: Notification System (NEW)

### 6.1 — `src/utils/api/notificationApi.js` (NEW)

Already described in 1.8.

### 6.2 — `src/components/NotificationBell.jsx` (NEW)

A bell icon in the Navbar showing unread notification count:
- On mount: `GET /api/notifications/{userId}` to fetch all notifications
- Show badge with count of `read === false` notifications
- Dropdown panel listing notifications (message, date, read status)
- Click notification → `PUT /api/notifications/mark-read/{notifId}` → update local state
- "Mark all as read" button → loop through unread and mark each

### 6.3 — `src/components/Navbar.jsx`

**Changes**:
- Add `<NotificationBell />` component next to the user menu for all authenticated users
- Add organizer dashboard link when `user.role === 'organizer'`
- Show role-appropriate dashboard link:
  - `admin` → `/admin/dashboard`
  - `organizer` → `/organizer/dashboard`
  - `attendee` → `/dashboard`

---

## PART 7: Schema & Form Updates

### 7.1 — `src/lib/schemas.js`

**Changes**:
- `signUpSchema`: Rename `name` → `username` (matching API field). Keep 2-50 char validation.
- `eventSchema`: Rewrite to match API:
  ```js
  eventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    date: z.string().min(1, "Date is required"),  // ISO 8601 datetime
    location: z.string().min(1, "Location is required"),
    maxAttendance: z.coerce.number().min(1, "Must be at least 1"),
    eventStatus: z.enum(["SCHEDULED", "COMPLETED", "CANCELED"]),
    paymentRequired: z.boolean(),
    price: z.coerce.number().min(0).optional(),  // required if paymentRequired
    organizerId: z.coerce.number(),
    categoryId: z.coerce.number(),
  })
  ```
- `organizerSchema`: Simplify to match `POST /api/auth/register/organizer`:
  ```js
  organizerSchema = z.object({
    username: z.string().min(2).max(50),
    email: z.string().email(),
    password: passwordSchema,
  })
  ```
- Remove `image` from eventSchema.
- Add `categorySchema`: `z.object({ name: z.string().min(1) })`

### 7.2 — AuthPage.jsx

- Rename form field `name` → `username` in signup form
- Fix `onSignUpSubmit`: pass `{ username: data.username, email: data.email, password: data.password }` as object to `signup()`
- Display `user.username` instead of `user.name` in welcome message

---

## PART 8: Existing Flaws to Fix

### 8.1 — Critical Fixes

| # | Issue | File | Fix |
|---|-------|------|-----|
| F1 | Test credentials in authApi | `authApi.js` | Remove entirely (Part 1.2) |
| F2 | Signup positional args mismatch | `AuthPage.jsx` | Pass object (Part 7.2) |
| F3 | `user.name` everywhere but API has `username` | Multiple files | Global rename `user.name` → `user.username` |
| F4 | `venue` → `location` everywhere | Multiple files | Global rename in display logic |
| F5 | `capacity` → `maxAttendance` everywhere | Multiple files | Global rename |
| F6 | `event.registered` doesn't exist in API | Multiple files | Fetch from registration count endpoints or remove |
| F7 | `useRegistrations` hook has mock data | `useRegistrations.js` | Rewrite to use real API |
| F8 | `bookingApi` hits non-existent endpoints | `bookingApi.js` | Replace with `registrationApi` (Part 1.4) |
| F9 | No organizer role handling | `ProtectedRoute`, `Navbar`, `App` | Add throughout (Parts 2.2, 2.3, 6.3) |
| F10 | `useIdleTimer.js` deleted but import may remain | Check for dead imports | Clean up |
| F11 | `event.price === 0` for free check | Multiple | Use `event.paymentRequired === false` |

### 8.2 — Medium Priority Fixes

| # | Issue | File | Fix |
|---|-------|------|-----|
| F12 | Multi-ticket logic not in API | `RegisterPage`, `PaymentPage` | Remove multi-ticket, 1 registration per user |
| F13 | Payment API params wrong | `PaymentPage.jsx` | Use query params (Part 5.4) |
| F14 | Payment response is string not object | `PaymentPage.jsx` | Set iframe URL directly from response |
| F15 | No category management | — | Add CategoryApi + AdminCategoriesPage (Parts 1.9, 4.4) |
| F16 | ResultPage redirect chain | `ResultPage.jsx` | Redirect to `/events` if no bookingResult |
| F17 | Layout idle timer stale closure | `Layout.jsx` | Move `resetTimer` inside useEffect |
| F18 | Dashboard receipt "PAID" for free | `DashboardPage.jsx` | Check `paymentRequired` field |

---

## PART 9: Backend Gaps Identified

These endpoints are needed but don't exist in the API:

| # | Missing Endpoint | Used By | Workaround |
|---|-----------------|---------|------------|
| G1 | `GET /api/users?role=ORGANIZER` (list organizers) | AdminOrganizersPage | Extract from events data |
| G2 | `GET /api/admin/stats` (dashboard stats) | AdminDashboardPage | Compute from events + registrations |
| G3 | Payment history per user | DashboardPage | Use registrations with status instead |
| G4 | Profile update endpoint | DashboardPage settings | Disable profile editing |
| G5 | Registration count for attendee view | EventDetailsPage capacity bar | May need backend to make this endpoint public, or show "seats available" without count |
| G6 | Event registration count in events list | EventsPage, event cards | Same as G5 — need public access to count endpoint |
| G7 | `DELETE /api/users/{id}` (delete organizer) | AdminOrganizersPage | Cannot delete organizers, remove delete button |

---

## PART 10: Implementation Order

Execute in this order to minimize broken states:

### Phase 1: Foundation (do first, everything depends on it)
1. Update `config.js` (port 8089)
2. Create role normalization utility
3. Rewrite `authApi.js` (remove mocks, map response)
4. Update `AuthContext.jsx` (role normalization, username field)
5. Update `ProtectedRoute.jsx` (support organizer role, array of roles)
6. Update `schemas.js` (all form schemas)

### Phase 2: API Layer (rewire all API files)
7. Rewrite `eventsApi.js` (correct field names)
8. Create `registrationApi.js` (replace bookingApi)
9. Rewrite `paymentApi.js` (query params)
10. Create `notificationApi.js`
11. Create `categoryApi.js`
12. Update `adminApi.js` (compute stats from real endpoints)
13. Rewrite `organizerApi.js` (only createOrganizer via auth endpoint)
14. Delete old `bookingApi.js`

### Phase 3: Routing & Navigation
15. Update `App.jsx` (add organizer routes, fix role guards)
16. Update `Navbar.jsx` (organizer link, notification bell)
17. Create `NotificationBell.jsx` component

### Phase 4: Fix Existing Pages
18. Fix `AuthPage.jsx` (username field, signup arg format)
19. Fix `EventsPage.jsx` (field names, client-side filtering)
20. Fix `EventDetailsPage.jsx` (field names, registration API, description)
21. Fix `RegisterPage.jsx` (remove multi-ticket, use registrationApi)
22. Fix `RegisterButton.jsx` (use registrationApi, fix HashRouter redirect)
23. Fix `PaymentPage.jsx` (query params, single ticket, iframe URL)
24. Fix `DashboardPage.jsx` (use registrationApi, field names, remove mocks)
25. Fix `ResultPage.jsx` (redirect to /events, clean up)

### Phase 5: Admin Pages
26. Fix `AdminDashboardPage.jsx` (compute stats, field names)
27. Fix `AdminEventsPage.jsx` (remove create, fix form fields, add category/status)
28. Fix `AdminOrganizersPage.jsx` (use auth register endpoint, simplify form)
29. Create `AdminCategoriesPage.jsx`

### Phase 6: Organizer Pages (NEW)
30. Create `OrganizerDashboardPage.jsx`
31. Create `OrganizerEventsPage.jsx` (create/edit events, category dropdown)

### Phase 7: Cleanup
32. Delete `useIdleTimer.js` if still exists
33. Delete `bookingApi.js` (replaced by registrationApi)
34. Update `useRegistrations.js` hook (use real endpoint)
35. Fix `usePaymentFlow.js` (ensure postMessage handling matches PayMob callback)
36. Remove all hardcoded fallback/mock data
37. Fix Layout idle timer stale closure
38. Global search for `user.name` → `user.username` references

---

## Summary Counts

- **API files to create**: 3 (notificationApi, categoryApi, registrationApi)
- **API files to rewrite**: 5 (authApi, eventsApi, paymentApi, adminApi, organizerApi)
- **API files to delete**: 1 (bookingApi)
- **New pages to create**: 4 (OrganizerDashboardPage, OrganizerEventsPage, AdminCategoriesPage, NotificationBell)
- **Existing pages to fix**: 11 (AuthPage, EventsPage, EventDetailsPage, RegisterPage, RegisterButton, PaymentPage, DashboardPage, ResultPage, AdminDashboardPage, AdminEventsPage, AdminOrganizersPage)
- **Context/routing to update**: 4 (AuthContext, ProtectedRoute, App.jsx, Navbar)
- **Schemas to update**: 4 (signUp, event, organizer, new category)
- **Backend gaps identified**: 7
