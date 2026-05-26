import mongoose from "mongoose";

const oauthClientSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  clientSecret: { type: String, required: true, select: false },
  name: { type: String, required: true },
  redirectUris: [{ type: String, required: true }],
});

export default mongoose.model("OAuthClient", oauthClientSchema);
