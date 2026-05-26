import crypto from "crypto";
import AuthorizationCode from "./authorization-code.model.js";
import OAuthClient from "./oauth-client.model.js";
import User from "../auth/auth.model.js";
import { generateAccessToken } from "../../common/utils/jwt.utils.js";
import ApiError from "../../common/utils/api-error.js";

const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("base64url");

export const ensureDemoClient = async () => {
  const clientId = process.env.OAUTH_DEMO_CLIENT_ID || "fletnix-demo";
  const secret = process.env.OAUTH_DEMO_CLIENT_SECRET || "demo-secret-change-me";

  return OAuthClient.findOneAndUpdate(
    { clientId },
    {
      $setOnInsert: {
        clientId,
        clientSecret: secret,
        name: "FletNix Demo App",
        redirectUris: [
          "http://localhost:5500/callback.html",
          "http://127.0.0.1:5500/callback.html",
        ],
      },
    },
    { upsert: true, returnDocument: "after" },
  );
};

export const authorize = async ({
  clientId,
  redirectUri,
  responseType,
  state,
  codeChallenge,
  codeChallengeMethod,
  userId,
}) => {
  if (responseType !== "code") {
    throw ApiError.badRequest("Only response_type=code is supported");
  }

  const client = await OAuthClient.findOne({ clientId });
  if (!client) throw ApiError.badRequest("Invalid client_id");

  if (!client.redirectUris.includes(redirectUri)) {
    throw ApiError.badRequest("Invalid redirect_uri");
  }

  if (!codeChallenge) {
    throw ApiError.badRequest("code_challenge required (PKCE)");
  }

  const code = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await AuthorizationCode.create({
    code,
    clientId,
    userId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod: codeChallengeMethod || "S256",
    expiresAt,
  });

  const url = new URL(redirectUri);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);

  return url.toString();
};

export const exchangeToken = async ({
  grantType,
  code,
  redirectUri,
  clientId,
  clientSecret,
  codeVerifier,
}) => {
  if (grantType !== "authorization_code") {
    throw ApiError.badRequest("Unsupported grant_type");
  }

  const client = await OAuthClient.findOne({ clientId }).select("+clientSecret");
  if (!client) throw ApiError.unauthorized("Invalid client");

  if (client.clientSecret !== clientSecret) {
    throw ApiError.unauthorized("Invalid client credentials");
  }

  const authCode = await AuthorizationCode.findOne({ code, clientId });
  if (!authCode || authCode.expiresAt < new Date()) {
    throw ApiError.badRequest("Invalid or expired code");
  }

  if (authCode.redirectUri !== redirectUri) {
    throw ApiError.badRequest("redirect_uri mismatch");
  }

  if (authCode.codeChallengeMethod === "S256") {
    if (sha256(codeVerifier) !== authCode.codeChallenge) {
      throw ApiError.badRequest("Invalid code_verifier");
    }
  }

  const user = await User.findById(authCode.userId);
  if (!user) throw ApiError.unauthorized("User not found");

  await AuthorizationCode.deleteOne({ _id: authCode._id });

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
    age: user.age,
  });

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 900,
  };
};

export const getUserInfo = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized("User not found");
  return {
    sub: String(user._id),
    email: user.email,
    age: user.age,
    name: user.name,
  };
};
