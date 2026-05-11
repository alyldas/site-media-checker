import type { ErrorResponse, InspectReport } from "@site-media-checker/core";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export async function inspectUrl(url: string): Promise<InspectReport> {
  const response = await fetch(`${API_BASE_URL}/inspect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const data = (await response.json()) as unknown;
  const apiError = errorMessage(data);

  if (!response.ok || apiError) {
    throw new Error(apiError ?? "Inspection failed.");
  }

  return data as InspectReport;
}

function errorMessage(data: unknown): string | null {
  if (!isErrorResponse(data)) {
    return null;
  }

  return data.error.message;
}

function isErrorResponse(data: unknown): data is ErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message === "string"
  );
}
