import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    show_id: { type: String, index: true },
    type: { type: String, index: true },
    title: { type: String, required: true },
    director: { type: String, default: null },
    cast: { type: String, default: null },
    country: { type: String, default: null },
    date_added: { type: String, default: null },
    release_year: { type: Number, default: null },
    rating: { type: String, index: true },
    duration: { type: String, default: null },
    listed_in: { type: String, default: null },
    description: { type: String, default: null },
  },
  { timestamps: false },
);

showSchema.index({ title: "text", cast: "text" });

export default mongoose.model("Show", showSchema);
