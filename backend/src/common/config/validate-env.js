const validateEnv = () => {
  const issues = [];

  const mongoUri = process.env.MONGODB_URI || "";
  if (!mongoUri) {
    issues.push("MONGODB_URI is missing.");
  } else if (!mongoUri.includes("@") && !mongoUri.includes("localhost")) {
    issues.push(
      "MONGODB_URI should include credentials for remote clusters, or use localhost for local Docker.",
    );
  }

  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
    issues.push("JWT_ACCESS_SECRET is missing or too short (min 32 characters).");
  }

  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
    issues.push("JWT_REFRESH_SECRET is missing or too short (min 32 characters).");
  }

  return issues;
};

export const getEmailTransportMode = () => {
  if (process.env.EMAIL_DEV_MODE === "console") return "console";
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return "smtp";
  }
  return "none";
};

export default validateEnv;
