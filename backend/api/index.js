import "dotenv/config";
import app from "../src/app.js";
import connectDB from "../src/common/config/db.js";
import validateEnv from "../src/common/config/validate-env.js";
import { ensureDemoClient } from "../src/modules/oauth/oauth.service.js";

const envIssues = validateEnv();
if (envIssues.length > 0) {
  console.error("[config] Environment issues:", envIssues.join("; "));
}

await connectDB();
await ensureDemoClient();

export default app;
