import * as showsService from "./shows.service.js";
import ApiResponse from "../../common/utils/api-response.js";

export const listShows = async (req, res) => {
  const { page, limit, type, search, country, year, language, rating, sort, genre, personalized } = req.query;

  let genresToApply;
  if (!search?.trim()) {
    if (personalized === "1" && req.user.favoriteGenres?.length) {
      genresToApply = req.user.favoriteGenres;
    } else if (genre?.trim()) {
      genresToApply = [genre.trim()];
    }
  }

  const result = await showsService.getShows({
    page,
    limit,
    type,
    search,
    country,
    year,
    language,
    rating,
    sort,
    userAge: req.user.age,
    genres: genresToApply,
  });

  ApiResponse.ok(res, "Shows fetched", result);
};

export const getFilterMeta = async (req, res) => {
  const result = await showsService.getFilterMeta({ userAge: req.user.age });
  ApiResponse.ok(res, "Show filters fetched", result);
};

export const getShow = async (req, res) => {
  const show = await showsService.getShowById(req.params.id);
  if (!show) {
    return res.status(404).json({ success: false, message: "Show not found" });
  }
  ApiResponse.ok(res, "Show fetched", show);
};
