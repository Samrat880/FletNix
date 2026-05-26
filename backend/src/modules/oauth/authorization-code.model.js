import mongoose from "mongoose";

const authorizationCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  redirectUri: { type: String, required: true },
  codeChallenge: { type: String },
  codeChallengeMethod: { type: String, default: "S256" },
  expiresAt: { type: Date, required: true },
});

authorizationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AuthorizationCode", authorizationCodeSchema);
