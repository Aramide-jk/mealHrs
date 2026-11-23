import { buildServer } from "./server";
import { runMigrations } from "./db/migrate";

const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST || "0.0.0.0";

async function main() {
  // Ensure database tables exist
  await runMigrations();

  const app = buildServer();

  try {
    const address = await app.listen({ port, host });
    console.log(`MealHrs API server listening on ${address}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

main();
