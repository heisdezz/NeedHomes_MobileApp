# NeedHomes Mobile App — Agent Guide

Codebase context for AI agents working on this project. Read this before making changes.

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Expo + React Native | 55 / 0.83 |
| Language | TypeScript | 5.9 |
| Routing | Expo Router (file-based) | 55 |
| Navigation | React Navigation (Stack, Tabs, Drawer) | 7.x |
| Server state | TanStack React Query | 5.99 |
| Client state | Zustand (persisted to SecureStore) | 5.0 |
| HTTP | Axios | 1.15 |
| Real-time | Socket.io-client | 4.8 |
| Forms | React Hook Form + Zod | 7.72 / 4.3 |
| Styling | twrnc (Tailwind for RN) | 4.16 |
| Toasts | sonner-native | 0.24 |
| Bottom sheets | @gorhom/bottom-sheet | 5.2 |
| Animations | React Native Reanimated | 4.2 |
| Keyboard | react-native-keyboard-controller | 1.20 |

---

## Directory Structure

```
app/                    # Expo Router pages (file = route)
  _layout.tsx           # Root layout — providers, StatusBar
  index.tsx             # Entry: hydrates store, redirects to correct section
  onboarding.tsx
  auth/                 # Sign-up, login, verify, KYC registration
  investor/             # All investor-facing screens
  partner/              # All partner-facing screens
  faq/                  # Shared FAQ screen

components/
  ui/                   # Reusable primitives (FormInput, Pagination, LogoutModal…)
  investor/             # Investor-specific components
  partner/              # Partner-specific components
  kyc/                  # KYC form components
  CHAT/                 # Chat/messaging components
  layout/               # Layout helpers
  annoucements/         # AnnouncementPage + drawer badges (QueryBadge, NotificationsBadge, ChatBadge)
  notifications/        # NotificationsPage shared component

constants/
  theme.ts              # Colors — single source of truth

hooks/                  # Custom React hooks (useHydration, usePagination…)
lib/
  api.ts                # Axios client + interceptors
  queries/              # React Query hooks grouped by domain
  mutations/            # React Query mutation hooks
  tw.ts                 # twrnc instance with tailwind.config.js
  storage.ts            # expo-secure-store wrapper for Zustand persist

store/
  auth-store.ts         # Auth + KYC state (persisted)
  onboarding-store.ts   # hasSeenOnboarding flag (persisted)
  socket-store.ts       # Socket.io connection (in-memory)

types/
  index.ts              # Shared TypeScript types (USER, USER_KYC, AccountType…)
```

---

## Routing Architecture

### Entry flow (`app/index.tsx`)
1. Wait for Zustand stores to hydrate (`useHydration`)
2. Show splash logo screen while waiting
3. Route based on state:
   - No onboarding → `/onboarding`
   - No auth → `/auth/sign-up`
   - `INVESTOR` → `/investor`
   - `PARTNER` → `/partner`

### Investor routes (`app/investor/`)
- `/(main)/(tabs)/` — tab bar: Home, Investments, Messages, Account
- `/properties/[propertyId]/invest/` — investment flows (co-dev, fractional-ownership, land-banking, outright-purchase, save-to-own)
- `/kyc`, `/wallet-pin`, `/settings`, `/profile-info`, `/BankDetails`, `/transactions`
- `/announcements`, `/notifications`

### Partner routes (`app/partner/`)
- `/(main)/(tabs)/` — tab bar: Home, Add, Messages, Account, Promotions
- `/transactions`, `/promotions`, `/message`
- `/announcements`, `/notifications`

### Auth routes (`app/auth/`)
- `/sign-up`, `/login`, `/verify`
- `/investor/individual`, `/investor/corporate`
- `/partner/`

Route guards live in each section's `_layout.tsx` — investor layout redirects non-investors, partner layout redirects non-partners.

---

## State Management

### Stores

**`useAuthStore`** (`store/auth-store.ts`) — persisted to SecureStore
- `auth: AUTHRECORD | null` — user object, accessToken, refreshToken, sessionId
- `kyc: USER_KYC | null` — KYC verification details including `account_verification_status`
- `tempUser: string | null` — temporary state during registration

Imperative helpers (safe outside React): `get_user_value()`, `set_user_value()`, `set_kyc_value()`, `clear_user()`, `clear_kyc()`

**`useOnboardingStore`** — persisted, holds `hasSeenOnboarding: boolean`

**`useSocketStore`** — in-memory Socket.io connection, `connect()` / `disconnect()` / `emit()` helpers
- Also tracks `chatUnreadCount` — incremented on `chat:newMessage` socket event; cleared via `clearChatUnread()` when user navigates to chat

### Hydration
Use `useHydration()` from `hooks/use-hydration.ts` whenever routing decisions depend on persisted state. It waits for both auth and onboarding stores to finish loading from SecureStore.

---

## API Layer

### `lib/api.ts`
- Base URL: `https://needhomes-backend-staging.onrender.com/`
- Request interceptor: injects `Authorization: Bearer <accessToken>` from auth store
- Response interceptor: handles 401 → refresh token → retry

### Queries (`lib/queries/`)
- `investor.ts` — properties, wallet, cashflow, investments, KYC, stats
- `partner.ts` — partner stats

### Mutations (`lib/mutations/`)
- `auth.ts` — register, login, logout (`useLogout` → `doLogout()`), KYC submit

### Pagination pattern
Use `usePagination` from `hooks/usePagination.ts`. Pair with `<Pagination>` component from `components/ui/Pagination.tsx`. Sync API meta via `setMeta(data.meta)` in a `useEffect`.

---

## Code Conventions

### Styling
- Always use `tw` from `@/lib/tw` for Tailwind classes.
- Use `Colors` from `@/constants/theme` for programmatic color values (not raw hex), unless the color is one-off.
- `tw` classes and `Colors` values are kept in sync — prefer semantic names (`Colors.brand`, `Colors.textMuted`).

### Components
- `components/ui/` — pure UI, no domain logic
- Domain components live in `components/investor/` or `components/partner/`
- `LogoutModal` is shared — always use it instead of `Alert.alert` for logout confirmations
- Keyboard handling: use `KeyboardAvoidingView` from `react-native-keyboard-controller` (not RN built-in)

### Forms
- React Hook Form + `zodResolver` for all forms
- `sonner-native` toasts: `success` must be a function — `success: () => "message"` not `success: "message"`

### toasts
```ts
toast.promise(promise, {
  loading: "Saving...",
  success: () => "Saved!",   // must be a function
  error: (e) => e?.message ?? "Error",
})
```

### Navigation
- Drawer menus use `navigation.closeDrawer()` before any route push
- `useRouter()` from `expo-router` for imperative navigation
- `DrawerActions.openDrawer()` dispatched via `useNavigation()`

---

## CI / CD

| Workflow | Trigger | Output |
|---|---|---|
| `build-apk.yml` | Push to `main` | Signed release APK (retained 30 days) |
| `build-debug.yml` | Manual (`workflow_dispatch`) | Debug APK (retained 14 days) |

Both workflows: Bun install → `expo prebuild --platform android` → Gradle build → artifact upload.

---

## Branch Strategy

- **`dev`** — active development; all feature work goes here
- **`main`** — production; only merge from dev when ready to release

**Rule:** Always push to `dev`. Only merge to `main` when the user explicitly asks.
