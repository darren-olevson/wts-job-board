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
  const isConfigured = isGoogleSheetsConfigured();
  // #region agent log
  console.info("[sheets-tracker] config check", {
    hypothesisId: "H1",
    isConfigured,
    hasProjectId: Boolean(process.env.GOOGLE_PROJECT_ID),
    hasClientEmail: Boolean(process.env.GOOGLE_CLIENT_EMAIL),
    hasPrivateKey: Boolean(process.env.GOOGLE_PRIVATE_KEY),
    hasSpreadsheetId: Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID),
    submissionId: submission.id,
    jobId: submission.jobId,
  });
  // #endregion
  // #region agent log
  fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "sheets-tracker-debug",
      hypothesisId: "H1",
      location: "src/lib/services/google-sheets-tracker.ts:69",
      message: "Sheets tracker config check",
      data: {
        isConfigured,
        hasProjectId: Boolean(process.env.GOOGLE_PROJECT_ID),
        hasClientEmail: Boolean(process.env.GOOGLE_CLIENT_EMAIL),
        hasPrivateKey: Boolean(process.env.GOOGLE_PRIVATE_KEY),
        hasSpreadsheetId: Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!isConfigured) {
    // #region agent log
    console.warn("[sheets-tracker] append skipped, missing config", {
      hypothesisId: "H1",
      submissionId: submission.id,
      jobId: submission.jobId,
    });
    // #endregion
    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "sheets-tracker-debug",
        hypothesisId: "H1",
        location: "src/lib/services/google-sheets-tracker.ts:88",
        message: "Sheets append skipped due to missing config",
        data: { submissionId: submission.id, jobId: submission.jobId },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return;
  }

  const sheets = getSheetsClient();
  const { spreadsheetId, sheetTabName } = getSheetsConfig();
  // #region agent log
  console.info("[sheets-tracker] append attempt", {
    hypothesisId: "H2",
    submissionId: submission.id,
    spreadsheetIdPrefix: spreadsheetId.slice(0, 8),
    sheetTabName,
  });
  // #endregion
  // #region agent log
  fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "sheets-tracker-debug",
      hypothesisId: "H2",
      location: "src/lib/services/google-sheets-tracker.ts:99",
      message: "Attempting sheets row append",
      data: {
        submissionId: submission.id,
        jobId: submission.jobId,
        spreadsheetIdPrefix: spreadsheetId.slice(0, 8),
        sheetTabName,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const values = [
    [
      submission.submittedAt,
      submission.jobTitle,
      submission.fullName,
      submission.email,
      submission.currentCompany,
      submission.currentLocation,
      submission.referredBy ?? "",
      submission.roleInterest,
      submission.resumeDriveFileUrl ?? "",
    ],
  ];

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetTabName}!A:I`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });
    // #region agent log
    console.info("[sheets-tracker] append succeeded", {
      hypothesisId: "H3",
      submissionId: submission.id,
      updatedRange: response.data.updates?.updatedRange ?? null,
      updatedRows: response.data.updates?.updatedRows ?? null,
    });
    // #endregion
    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "sheets-tracker-debug",
        hypothesisId: "H3",
        location: "src/lib/services/google-sheets-tracker.ts:127",
        message: "Sheets row append succeeded",
        data: {
          submissionId: submission.id,
          updatedRange: response.data.updates?.updatedRange ?? null,
          updatedRows: response.data.updates?.updatedRows ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : null;
    // #region agent log
    console.error("[sheets-tracker] append failed", {
      hypothesisId: "H4",
      submissionId: submission.id,
      status,
      errorMessage: message,
    });
    // #endregion
    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "sheets-tracker-debug",
        hypothesisId: "H4",
        location: "src/lib/services/google-sheets-tracker.ts:145",
        message: "Sheets row append failed",
        data: {
          submissionId: submission.id,
          status,
          errorMessage: message,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }
}
