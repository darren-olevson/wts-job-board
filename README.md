# WTS Internal Job Board

Modern blue-themed WTS careers web app with:

- Candidate-facing job board with category filters
- Application form with resume validation (`.pdf`/`.docx`)
- Internal `/admin` area to add/remove job listings
- Local JSON persistence for development
- Google Drive JSON persistence for Vercel deployments

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Set an admin password in `.env.local`:

```bash
ADMIN_PASSWORD=your-secure-password
```

4. Run development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` - public job board and filters
- `/jobs/[jobId]` - job details and description tab
- `/jobs/[jobId]/application` - application tab
- `/admin` - password-protected job management

## Mock Data Storage

- `data/jobs.json` - active job listings
- `data/submissions.json` - applicant metadata submissions

## Vercel Deployment (Google Drive backend)

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Create a Google service account with Drive API access.
4. Share a Google Drive folder with the service account email.
5. In Vercel Project Settings -> Environment Variables, set:
   - `ADMIN_PASSWORD`
   - `GOOGLE_PROJECT_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_DRIVE_FOLDER_ID`
   - Optional: `GOOGLE_JOBS_FILE_NAME` (default `jobs.json`)
   - Optional: `GOOGLE_SUBMISSIONS_FILE_NAME` (default `submissions.json`)
6. Redeploy.

Build command and output use Next.js defaults (`npm run build`).

## Storage Strategy

- If Google env vars are configured, runtime uses Drive-backed stores.
- If Google env vars are not configured, runtime falls back to local JSON in `data/`.
