import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import mongoose from "mongoose";
import connectDB from "../common/config/db.js";
import Show from "../modules/shows/show.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, "netflix_titles.csv");
const BATCH_SIZE = 500;

const mapRow = (row) => ({
  show_id: row.show_id?.trim() || null,
  type: row.type?.trim() || null,
  title: row.title?.trim() || "Untitled",
  director: row.director?.trim() || null,
  cast: row.cast?.trim() || null,
  country: row.country?.trim() || null,
  date_added: row.date_added?.trim() || null,
  release_year: parseInt(row.release_year, 10) || null,
  rating: row.rating?.trim() || null,
  duration: row.duration?.trim() || null,
  listed_in: row.listed_in?.trim() || null,
  description: row.description?.trim() || null,
});

const seed = async () => {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found at ${CSV_PATH}`);
    console.error("Download netflix_titles.csv from the assignment and place it there.");
    process.exit(1);
  }

  await connectDB();
  console.log("Connected to MongoDB");

  await Show.deleteMany({});
  console.log("Cleared existing shows");

  const results = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => results.push(mapRow(row)))
      .on("end", resolve)
      .on("error", reject);
  });

  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    const batch = results.slice(i, i + BATCH_SIZE);
    await Show.insertMany(batch);
    console.log(
      `Inserted ${Math.min(i + BATCH_SIZE, results.length)} / ${results.length}`,
    );
  }

  console.log("Seed complete!");
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
