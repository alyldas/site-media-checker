import { Hono } from "hono";

export const healthRoute = new Hono();

healthRoute.get("/", (c) =>
  c.json({
    ok: true,
    service: "site-media-checker-api",
    runtime: "deno-deploy",
  }));
