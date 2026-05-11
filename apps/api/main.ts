import app from "./src/app.ts";

export default {
  fetch(
    request: Request,
    env: Record<string, unknown>,
    executionContext?: unknown,
  ) {
    return app.fetch(request, env, executionContext as never);
  },
};
