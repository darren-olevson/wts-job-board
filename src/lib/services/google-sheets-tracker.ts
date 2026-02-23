import { JWT } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";

import { JobApplication } from "@/lib/types";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_SHEET_TAB_NAME = "Application Submissions";

let cachedSheetsClient: sheets_v4.Sheets | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Google env var: ${name}`);
  }
  return value;
}

function getSheetsConfig() {
  const projectId = getRequiredEnv("GOOGLE_PROJECT_ID");
  const clientEmail = getRequiredEnv("GOOGLE_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  const sheetTabName =
    process.env.GOOGLE_SHEETS_TAB_NAME || DEFAULT_SHEET_TAB_NAME;

  return {
    projectId,
    clientEmail,
    privateKey,
    spreadsheetId,
    sheetTabName,
  };
}

export function isGoogleSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_PROJECT_ID &&
      process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  );
}

function getSheetsClient() {
  if (cachedSheetsClient) {
    return cachedSheetsClient;
  }

  const { projectId, clientEmail, privateKey } = getSheetsConfig();
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [SHEETS_SCOPE],
    projectId,
  });

  cachedSheetsClient = google.sheets({
    version: "v4",
    auth,
  });

  return cachedSheetsClient;
}

export async function appendApplicationSubmissionRow(
  submission: JobApplication,
) {
  if (!isGoogleSheetsConfigured()) {
    return;
  }

  const sheets = getSheetsClient();
  const { spreadsheetId, sheetTabName } = getSheetsConfig();
  const values = [
    [
      submission.submittedAt,
      submission.id,
      submission.jobId,
      submission.jobTitle,
      submission.fullName,
      submission.email,
      submission.currentCompany,
      submission.currentLocation,
      submission.roleInterest,
      submission.resumeFileName,
      String(submission.resumeFileSize),
      submission.resumeDriveFileUrl ?? "",
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetTabName}!A:L`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}
