import { opine, opineCors } from "./deps.ts";

const BACKEND_PORT = Deno.env.get("BACKEND_PORT");
if (BACKEND_PORT === undefined || isNaN(parseInt(BACKEND_PORT))) {
  throw new Error(
    "BACKEND_PORT environment variable is not set to a valid port number",
  );
}

const port = parseInt(BACKEND_PORT);
const app = opine();

const APP_REQUEST_ORIGIN = Deno.env.get("APP_REQUEST_ORIGIN");
if (APP_REQUEST_ORIGIN) {
  app.use(opineCors({ origin: APP_REQUEST_ORIGIN }));
}

app.get("/hello", (req, res) => {
  res.json("Hello World");
});

app.listen({ port });

console.log(`API listening on port ${port}`);
