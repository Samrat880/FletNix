import nodemailer from "nodemailer";
import ApiError from "../utils/api-error.js";
import { getEmailTransportMode } from "./validate-env.js";

const frontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:4200").replace(/\/$/, "");

const sender = {
  email: process.env.SMTP_FROM_EMAIL || "noreply@fletnix.app",
  name: process.env.SMTP_FROM_NAME || "FletNix",
};

const smtpTransporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

const transportMode = getEmailTransportMode();

const sendEmail = async (to, subject, html, text) => {
  if (transportMode === "console") {
    console.log("\n[EMAIL_DEV_MODE=console]");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("");
    return;
  }

  if (transportMode !== "smtp" || !smtpTransporter) {
    throw ApiError.badRequest(
      "Email is not configured. Set SMTP credentials or EMAIL_DEV_MODE=console.",
    );
  }

  try {
    await smtpTransporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    throw ApiError.badRequest(err?.message || "Failed to send email");
  }
};

export const sendResetPasswordEmail = async (email, token) => {
  const url = `${frontendUrl()}/reset-password/${token}`;
  await sendEmail(
    email,
    "Reset your FletNix password",
    `<h2>Password Reset</h2><p>Click <a href="${url}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
    `Reset your password: ${url}`,
  );
};
