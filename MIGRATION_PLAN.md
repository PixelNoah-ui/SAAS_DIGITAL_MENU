# Session Management Migration Plan

## Overview

This document outlines the migration from the insecure localStorage-based session system to a production-grade HTTP-only cookie-based system.

---

## Current System (Before)

```
Frontend (localStorage)                    Backend
┌─────────────────────────┐              ┌─────────────────────────┐
│ sessionStorage:        │   GET         │                         │
│ {                      │ ────────────► │  /orders/session?       │
│   sessionToken: "abc", │   ?sessionToken│   sessionToken=abc    │
│   tableId: "123"       │                │                         │
│ }                      │                │                         │
└─────────────────────────┘              └─────────────────────────┘
       │                                          │
       │ ❌ Token exposed in URL                 │
       │ ❌ Vulnerable to XSS                     │
       │ ❌ No server control                    │
       │ ❌ Scalability issues                    │
       ▼                                          ▼
```

---

## New System (After)

```
Frontend (HTTP-only cookie)               Backend
┌─────────────────────────┐              ┌─────────────────────────┐
│ Cookies:                │   GET         │                         │
│ session_token=abc       │ ────────────► │  /orders/session        │
│ (httpOnly, secure)      │   Cookie      │  (reads cookie)        │
│                         │               │                         │
└─────────────────────────┘              └─────────────────────────┘
       │                                          │
       │ ✅ Token never exposed to JS             │
       │ ✅ Server-controlled                     │
       │ ✅ Secure & scalable                     │
       ▼                                          ▼
```

---

## Migration Steps

### Phase 1: Backend Changes (Deploy First)

1. **Deploy new session middleware** (`sessionMiddleware.ts`)
2. **Deploy new session controller** (`sessionController.ts`)
3. **Deploy new session router** (`sessionRouter.ts`)
4. **Update order controller** to use `req.session` from cookie
5. **Update order router** to use `requireSession` middleware

### Phase 2: Frontend Changes (Deploy Second)

1. **Update TableContext.tsx**
   - Remove sessionToken storage
   - Call `createSession()` after table lookup
   - Keep table data in sessionStorage (for display only)

2. **Update hooks**
   - `useSession.ts` - Remove localStorage usage
   - `useGetOrders.ts` - No parameters needed

3. **Update pages**
   - `active/page.tsx` - Use `useGetOrders()` without params

### Phase 3: Cleanup (Deploy Third)

1. **Remove old files**
   - Delete `CreateSession.ts` (old API)
   - Delete `getOrdersBySession.ts` (old API)
   - Delete `useGetOrdersBySession.ts` (old hook)

2. **Database cleanup** (optional)
   - Old sessions without tokens can be cleaned up
   - Run: `DELETE FROM "OrderSession" WHERE "sessionToken" IS NULL`

---

## Backward Compatibility

During the transition period, support both systems:

```typescript
// In getOrdersBySession - support both old and new
export const getOrdersBySession = catchAsync(async (req, res, next) => {
  // NEW: Read from cookie
  if (req.cookies?.session_token) {
    const session = await prisma.orderSession.findUnique({
      where: { sessionToken: req.cookies.session_token },
    });
    // ... fetch orders
  }

  // OLD: Read from query param (temporary)
  const { sessionToken } = req.query;
  if (sessionToken) {
    const session = await prisma.orderSession.findUnique({
      where: { sessionToken: sessionToken as string },
    });
    // ... fetch orders
  }

  return next(new AppError("Session required", 401));
});
```

Remove backward compatibility after full rollout.

---

## Environment Variables

Add to backend `.env`:

```env
# Session configuration
SESSION_EXPIRE_HOURS=3

# Cookie security (production)
NODE_ENV=production
```

Add to frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## CORS Configuration

Ensure backend allows credentials:

```typescript
// backend/src/index.ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g., http://localhost:3000
    credentials: true, // Allow cookies
  }),
);
```

Ensure frontend sends credentials:

```typescript
// frontend/app/(api)/session.ts
fetch(url, {
  credentials: "include", // Important!
});
```

---

## Security Checklist

- [x] HTTP-only cookies (cannot be accessed by JavaScript)
- [x] Secure flag (HTTPS only in production)
- [x] SameSite=lax (prevents CSRF)
- [x] Server-generated cryptographically secure tokens
- [x] Session expiration (3 hours)
- [x] No token exposure in URLs
- [x] Server-side session validation

---

## Common Pitfalls

### 1. Missing credentials: "include"

```typescript
// ❌ Wrong
fetch(url);

// ✅ Correct
fetch(url, { credentials: "include" });
```

### 2. CORS not allowing credentials

```typescript
// ❌ Wrong
app.use(cors({ origin: "*" }));

// ✅ Correct
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
```

### 3. Cookie not set on localhost

```typescript
// In production, secure=true works
// In development, may need to set secure: false
res.cookie("session_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});
```

### 4. Session not being read

```typescript
// Ensure cookie-parser is used
app.use(cookieParser());

// Check req.cookies exists
console.log(req.cookies); // Should have session_token
```

---

## Testing Checklist

- [ ] Scan QR code → session created → cookie set
- [ ] Refresh page → session persists (cookie)
- [ ] Create order → order associated with session
- [ ] View active orders → orders fetched via cookie
- [ ] Session expires → redirect to scan QR
- [ ] Different browser → separate sessions
- [ ] Incognito mode → new session required

---

## Rollback Plan

If issues occur:

1. **Revert backend** - Old order routes still work with query param
2. **Revert frontend** - Uses old localStorage system
3. **Database** - No schema changes needed

---

## File Changes Summary

### Created

- `backend/src/middleware/sessionMiddleware.ts`
- `backend/src/controller/sessionController.ts`
- `backend/src/router/sessionRouter.ts`
- `frontend/app/(api)/session.ts`
- `frontend/hooks/useGetOrders.ts`

### Modified

- `backend/src/index.ts` - Added session router
- `backend/src/router/orderRouter.ts` - Added requireSession
- `backend/src/controller/orderController.ts` - Use req.session
- `frontend/context/TableContext.tsx` - Auto-create session
- `frontend/hooks/useSession.ts` - Remove localStorage
- `frontend/app/active/page.tsx` - Use new hook

### To Delete (after migration)

- `frontend/app/(api)/CreateSession.ts`
- `frontend/app/(api)/getOrdersBySession.ts`
- `frontend/hooks/useGetOrdersBySession.ts`
