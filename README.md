# Jolie Kids Maison — Website & Parent Portal

## What's in here
- `index.html` — marketing homepage (hero, about, programs & fees, gallery, contact)
- `login.html` / `signup.html` — parent auth (phone + password, client-side salted SHA-256 hashing)
- `dashboard.html` — parent dashboard (register child, my children, update profile)
- `register-child.html` — child registration form (fields are a starting point — tell me the final list and I'll update it)
- `attendance.html` — daily QR check-in flow
- `css/`, `js/`, `assets/` — styles, scripts, images/icons
- `appscript/Code.gs` — Google Apps Script backend (Sheets as database)

## Setup steps

1. **Create a Google Sheet** — any name, e.g. "Jolie Kids Maison DB".
2. **Extensions → Apps Script**, delete the placeholder code, paste in `appscript/Code.gs`.
3. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Copy the resulting Web App URL.
4. Paste that URL into `js/config.js` as `APP_CONFIG.API_URL`.
5. In the Apps Script editor, run `ensureSheets` once (via the function dropdown ▸ Run) to create the four sheets (Parents, Children, Attendance, Settings) with headers.
6. **Set up the daily QR token trigger**: in Apps Script, Triggers (clock icon) → Add Trigger → function `generateDailyToken` → Time-driven → Day timer → pick a time (e.g. midnight). This is what rotates the QR code every day.
7. To get today's printable QR code, run `getTodayQrImageUrl("https://your-deployed-site-url")` from the Apps Script editor and check the log (View → Logs) for the image link — print or display it at the entrance each morning.
8. **Host the frontend**: push this folder to GitHub Pages, or deploy to Vercel (drag-and-drop or `vercel deploy`). Static hosting is enough — the backend is entirely the Apps Script Web App.

## Notes / things to finalize together
- Real photos for the hero slideshow and gallery (currently using placeholder stock photos) — swap into `assets/images/` and update the `src`/`background-image` paths.
- Final field list for child registration.
- Contact details, address, and map embed in the Contact section.
- Consider Firebase/Supabase Auth down the line if you want stronger security guarantees than hashed-password-in-a-Sheet.
