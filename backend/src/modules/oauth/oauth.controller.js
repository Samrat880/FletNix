import * as oauthService from "./oauth.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import ApiError from "../../common/utils/api-error.js";

export const authorize = async (req, res) => {
  const {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
  } = req.query;

  if (!clientId || !redirectUri) {
    throw ApiError.badRequest("client_id and redirect_uri are required");
  }

  const redirectUrl = await oauthService.authorize({
    clientId,
    redirectUri,
    responseType,
    state,
    codeChallenge,
    codeChallengeMethod,
    userId: req.user.id,
  });

  if (req.headers.accept?.includes("application/json")) {
    return ApiResponse.ok(res, "Authorization successful", { redirectUrl });
  }

  return res.redirect(redirectUrl);
};

export const token = async (req, res) => {
  const {
    grant_type: grantType,
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
  } = req.body;

  const tokens = await oauthService.exchangeToken({
    grantType,
    code,
    redirectUri,
    clientId,
    clientSecret,
    codeVerifier,
  });

  res.json(tokens);
};

export const userinfo = async (req, res) => {
  const info = await oauthService.getUserInfo(req.user.id);
  ApiResponse.ok(res, "User info", info);
};
