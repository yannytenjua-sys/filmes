const express = require("express");
const { Movie, Favorite } = require("../models");
const { authenticate } = require("../middleware/auth");
const tmdbService = require("../services/tmdbService");
const { Op, fn, col, where: sequelizeWhere } = require("sequelize");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const sort = [
      "title",
      "vote_average",
      "release_date",
      "popularity",
      "created_at",
    ].includes(req.query.sort)
      ? req.query.sort
      : "created_at";
    const order = req.query.order === "ASC" ? "ASC" : "DESC";

    const where = {};
    
    if (req.query.media_type) where.media_type = req.query.media_type;
    
    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { original_title: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    if (req.query.year) {
      const year = parseInt(req.query.year);
      where[Op.and] = [
        sequelizeWhere(
          fn("YEAR", col("release_date")),
          Op.eq,
          year
        )
      ];
    }
    
    if (req.query.genre) {
      const genreId = parseInt(req.query.genre);
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        sequelizeWhere(
          fn("JSON_CONTAINS", col("genres"), JSON.stringify({ id: genreId })),
          Op.eq,
          1
        )
      );
    }

    const { count, rows } = await Movie.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sort, order]],
    });

    res.json({
      results: rows,
      page,
      total_pages: Math.ceil(count / limit),
      total_results: count,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/genres/available", async (req, res, next) => {
  try {
    const movies = await Movie.findAll({
      attributes: ["genres"],
      where: { genres: { [require("sequelize").Op.ne]: null } },
    });

    const genresMap = new Map();
    movies.forEach((movie) => {
      let genresArray = movie.genres;
      
      if (typeof genresArray === "string") {
        genresArray = JSON.parse(genresArray);
      }
      
      if (Array.isArray(genresArray)) {
        genresArray.forEach((g) => {
          if (typeof g === "object" && g.id && g.name) {
            if (!genresMap.has(g.id)) {
              genresMap.set(g.id, g.name);
            }
          }
        });
      }
    });

    const genres = Array.from(genresMap).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    res.json({ genres });
  } catch (err) {
    next(err);
  }
});

router.get("/years/available", async (req, res, next) => {
  try {
    const movies = await Movie.findAll({
      attributes: ["release_date"],
      where: { release_date: { [require("sequelize").Op.ne]: null } },
    });

    const yearsSet = new Set();
    movies.forEach((movie) => {
      if (movie.release_date) {
        const year = new Date(movie.release_date).getFullYear();
        yearsSet.add(year);
      }
    });

    const years = Array.from(yearsSet).sort((a, b) => b - a);
    res.json({ years });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ error: "Filme não encontrado" });
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/import/:mediaType/:tmdbId",
  authenticate,
  async (req, res, next) => {
    try {
      const { mediaType, tmdbId } = req.params;

      const existing = await Movie.findOne({ where: { tmdb_id: tmdbId } });
      if (existing)
        return res.json({ message: "Já importado", movie: existing });

      let details;
      if (mediaType === "tv") {
        details = await tmdbService.getTVDetails(tmdbId);
      } else {
        details = await tmdbService.getMovieDetails(tmdbId);
      }

      const movie = await Movie.create({
        tmdb_id: details.id,
        title: details.title || details.name,
        original_title: details.original_title || details.original_name,
        overview: details.overview,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        release_date: details.release_date || null,
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        popularity: details.popularity,
        genres: details.genres,
        media_type: mediaType,
        runtime: details.runtime || null,
        status: details.status,
        tagline: details.tagline,
        original_language: details.original_language,
        number_of_seasons: details.number_of_seasons || null,
        number_of_episodes: details.number_of_episodes || null,
        first_air_date: details.first_air_date || null,
        last_air_date: details.last_air_date || null,
      });

      res.status(201).json({ message: "Importado com sucesso", movie });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;