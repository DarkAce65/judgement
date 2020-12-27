import { opine } from "./deps.ts";

const BACKEND_PORT = Deno.env.get("BACKEND_PORT");
if (BACKEND_PORT === undefined || isNaN(parseInt(BACKEND_PORT))) {
  throw new Error(
    "BACKEND_PORT environment variable is not set to a valid port number",
  );
}

const port = parseInt(BACKEND_PORT);
const app = opine();

app.get("/hello", (req, res) => {
  res.json("Hello World");
});

app.listen({ port });

console.log(`API running on port ${port}`);
