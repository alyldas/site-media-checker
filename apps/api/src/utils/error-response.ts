import type {
  ErrorCode,
  ErrorResponse,
} from "../../../../packages/core/src/types.ts";

export function errorResponse(
  code: ErrorCode,
  message: string,
): ErrorResponse {
  return {
    version: "1.0.0",
    error: {
      code,
      message,
    },
  };
}
