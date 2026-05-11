import { Hono } from "hono";
import { cors } from "hono/cors";
import { getConfig } from "./utils/config.ts";
import { errorResponse } from "./utils/error-response.ts";
import { healthRoute } from "./routes/health.ts";
import { inspectRoute } from "./routes/inspect.ts";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      const config = getConfig();

      if (!origin) {
        return null;
      }

      return config.allowedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);

app.route("/health", healthRoute);
app.route("/inspect", inspectRoute);

app.notFound((c) =>
  c.json(
    errorResponse("not_found", "Endpoint not found"),
    404,
  )
);

app.onError((error, c) => {
  console.error(error);

  return c.json(
    errorResponse("internal_error", "Unexpected API error"),
    500,
  );
});

export default app;
