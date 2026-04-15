# Site Map

## `/` — Entry point
Redirects based on onboarding and auth state.

## `/onboarding`
Splash screen (1.5s auto-advance) → onboarding slides.

---

## `/auth`
| Route | File | Description |
|---|---|---|
| `/auth/sign-up` | `auth/sign-up.tsx` | Choose account type: Investor or Partner |
| `/auth/login` | `auth/login.tsx` | Login |
| `/auth/verify` | `auth/verify.tsx` | Email OTP verification (6-digit) |
| `/auth/partner` | `auth/partner/index.tsx` | Partner registration form |
| `/auth/investor/individual` | `auth/investor/individual.tsx` | Individual investor registration |
| `/auth/investor/corporate` | `auth/investor/corporate.tsx` | Corporate investor registration |

---

## `/reset-password`
| Route | File | Description |
|---|---|---|
| `/reset-password` | `reset-password/index.tsx` | Enter email to request reset link |
| `/reset-password/password-otp` | `reset-password/password-otp.tsx` | 6-digit OTP verification — params: `email` |
| `/reset-password/reset-password` | `reset-password/reset-password.tsx` | Set new password — params: `token` |

---

## `/investor/(tabs)` — Investor app (bottom tabs)
| Tab | Route name | File | Description |
|---|---|---|---|
| Home | `index` | `investor/(tabs)/index.tsx` | Home screen |
| Message | `message` | `investor/(tabs)/message.tsx` | Messages |
| Add | `add` | `investor/(tabs)/add.tsx` | Add (center FAB tab) |
| Investment | `investment` | `investor/(tabs)/investment.tsx` | Investments |
| Account | `account` | `investor/(tabs)/account.tsx` | Account |

### Investor drawer (overlay, not a route)
Opened via `useDrawer()` context. Items: Profile Info, My Investments, Wallet, Properties, Transactions, Announcements, Chat, Notifications, Settings, Log Out.

---

## `/partner/(tabs)` — Partner app (bottom tabs)
| Tab | Route name | File | Description |
|---|---|---|---|
| Home | `index` | `partner/(tabs)/index.tsx` | Home screen |
