# P.B.I. Labs Vault

Bilingual cash-flow vault. Free accounts sign in with Supabase and keep the statement on the device. Pro accounts activate a Gumroad license on up to two devices. Free accounts can show AdSense. Pro accounts do not.

## What changed in the security pass

- A Pro key is accepted only after `verifyGumroad` confirms it with Gumroad and reserves a device seat. The key is not shown on the dashboard.
- Recovery codes are hashed in Supabase and are not returned to the browser.
- License, seat, reminder, and webhook writes use the Supabase **service role** on the server.
- The Gumroad webhook ignores calls that do not include `GUMROAD_WEBHOOK_TOKEN`.
- Marking a debt paid posts that payment on the statement. Receiving a yield posts the passive income.
- Logging out of Pro releases that device's seat.

## Run it

From `pbi-labs-app`:

```bash
npm install
npx netlify dev
```

`npm start` alone does not serve the license functions, so Pro activation will fail closed. That is intentional.

## Netlify environment

Copy `.env.example`. In the Netlify UI, set every variable. Only `REACT_APP_` values may be public.

Server-only names, and what they are for:

| Name | Purpose |
|---|---|
| `SUPABASE_URL` | Same project URL as the public one |
| `SUPABASE_SERVICE_ROLE_KEY` | Writes licenses, seats, reminders |
| `GUMROAD_PRODUCT_PERMALINK` | Product the license must belong to |
| `GUMROAD_WEBHOOK_TOKEN` | Secret you put on the Gumroad ping URL |
| `BREVO_API_KEY` | Sends the recovery email |
| `BREVO_SENDER_EMAIL` | A sender Brevo has verified |
| `OTP_PEPPER` | Extra secret mixed into recovery-code hashes |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web push when the app is closed |
| `VAPID_SUBJECT` | `mailto:` contact for the push service |

Public names:

| Name | Purpose |
|---|---|
| `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` | Free sign-in only |
| `REACT_APP_GUMROAD_URL` | Buy button |
| `REACT_APP_ADSENSE_CLIENT` | `ca-pub-...` |
| `REACT_APP_ADSENSE_SLOT_BANNER` / `REACT_APP_ADSENSE_SLOT_CARD` | Ad units |
| `REACT_APP_VAPID_PUBLIC_KEY` | Same public key as `VAPID_PUBLIC_KEY` |

Do not rename private keys to `REACT_APP_`. Create React App would publish them in the JavaScript bundle.

Gumroad ping URL:

```text
https://YOUR-SITE.netlify.app/.netlify/functions/gumroadWebhook?token=YOUR_GUMROAD_WEBHOOK_TOKEN
```

The webhook re-checks the license with Gumroad before it marks the license active or dead. A cancelled subscription stays valid until Gumroad says the period has ended.

## Database

Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor. It adds the OTP columns and the reminder tables, and turns on row-level security with no anon access.

The old committed `.env` only held the public Supabase URL and anon key. It is removed from the branch. Rotate the anon key if you want a clean history; the service role was never in that file.

## Ads (free tier only)

Ads render only when both the client id and a slot id are set, and only when the person is not in a Pro session. Pro inside the vault never mounts an ad. There is no placeholder box.

When you are ready:

1. Create the AdSense units and paste the ids into the `REACT_APP_ADSENSE_*` variables.
2. Add `public/ads.txt` with the line AdSense gives you (`google.com, pub-..., DIRECT, ...`).
3. Redeploy. The script loads only on screens that actually show an ad.

## Payment reminders

In Action Center, turn reminders on, pick a tone (gentle, direct, urgent), and how many days ahead to warn. The wording follows the tone. While the vault is open, this device also plays a short chime in that tone. Phone browsers pick the notification sound themselves when the app is closed; the custom chime cannot override that.

Closed-app push:

```bash
npx web-push generate-vapid-keys
```

Put the public key in both VAPID variables listed above, the private key only in `VAPID_PRIVATE_KEY`, then redeploy. A scheduled function checks once a day at 13:00 UTC and sends due payment reminders. Turning reminders off clears them from the server.
