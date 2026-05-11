import app from "./src/app.ts";

Deno.serve(
  {
    port: Number.parseInt(Deno.env.get("PORT") ?? "8787", 10),
  },
  (request) => app.fetch(request, {}, undefined),
);
