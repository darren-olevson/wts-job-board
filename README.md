# WTS Internal Job Board

Modern blue-themed WTS careers web app with:

- Candidate-facing job board with category filters
- Application form with resume validation (`.pdf`/`.docx`)
- Internal `/admin` area to add/remove job listings
- Mock/local JSON persistence for jobs + submissions
- Service abstraction ready for Google Drive/Sheets integration in phase 2

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
- `/jobs/[jobId]/apply` - application form per job
- `/admin` - password-protected job management

## Mock Data Storage

- `data/jobs.json` - active job listings
- `data/submissions.json` - applicant metadata submissions

## Vercel Deployment

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. In Vercel Project Settings -> Environment Variables, set:
   - `ADMIN_PASSWORD`
   - (phase 2 placeholders when implemented) `GOOGLE_*`
4. Deploy.

Build command and output use Next.js defaults (`npm run build`).

## Phase 2 Integration Notes

Google adapters are stubbed in `src/lib/services/google-stores.ts`.  
Current runtime uses local stores via `src/lib/services/index.ts`.
