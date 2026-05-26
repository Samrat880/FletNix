import mongoose from "mongoose";
import Show from "./show.model.js";

const parsePositiveInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseOptionalInt = (value) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilter = ({ type, search, userAge, country, year, language, rating }) => {
  const filter = {};

  if (typeof userAge === "number" && userAge < 18) {
    filter.rating = { $nin: ["R"] };
  }

  if (type && type !== "All") {
    filter.type = type;
  }

  if (search?.trim()) {
    filter.$text = { $search: search.trim() };
  }

  if (country?.trim()) {
    filter.country = { $regex: escapeRegex(country.trim()), $options: "i" };
  }

  const parsedYear = parseOptionalInt(year);
  if (parsedYear) {
    filter.release_year = parsedYear;
  }

  if (language?.trim()) {
    // Dataset does not have a dedicated language field; use listed_in tags as language-like category filter.
    filter.listed_in = { $regex: escapeRegex(language.trim()), $options: "i" };
  }

  if (rating?.trim()) {
    if (typeof userAge === "number" && userAge < 18 && rating.trim().toUpperCase() === "R") {
      filter.rating = { $in: [] };
    } else {
      filter.rating = rating.trim();
    }
  }

  return filter;
};

const sortMap = {
  newest: { release_year: -1, title: 1 },
  oldest: { release_year: 1, title: 1 },
  rating: { rating: -1, title: 1 },
  title: { title: 1 },
};

export const getShows = async ({
  page,
  limit,
  type,
  search,
  userAge,
  country,
  year,
  language,
  rating,
  sort,
}) => {
  const pageNum = parsePositiveInt(page, 1);
  const limitNum = parsePositiveInt(limit, 15);
  const skip = (pageNum - 1) * limitNum;

  const filter = buildFilter({
    type,
    search,
    userAge,
    country,
    year,
    language,
    rating,
  });

  const sortQuery = sortMap[sort] || sortMap.newest;

  const [shows, total] = await Promise.all([
    Show.find(filter).sort(sortQuery).skip(skip).limit(limitNum).lean(),
    Show.countDocuments(filter),
  ]);

  return {
    shows,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

export const getFilterMeta = async ({ userAge }) => {
  const ageFilter =
    typeof userAge === "number" && userAge < 18 ? { rating: { $nin: ["R"] } } : {};

  const [countries, years, ratings, listedIn] = await Promise.all([
    Show.distinct("country", ageFilter),
    Show.distinct("release_year", ageFilter),
    Show.distinct("rating", ageFilter),
    Show.distinct("listed_in", ageFilter),
  ]);

  return {
    countries: countries.filter(Boolean).sort((a, b) => a.localeCompare(b)).slice(0, 120),
    years: years.filter(Boolean).sort((a, b) => b - a),
    ratings: ratings.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    languages: listedIn
      .filter(Boolean)
      .flatMap((entry) => String(entry).split(","))
      .map((x) => x.trim())
      .filter(Boolean)
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 80),
  };
};

export const getShowById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return Show.findById(id).lean();
};
