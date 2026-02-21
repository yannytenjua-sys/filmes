const express = require("express");
const tmdbService = require("../services/tmdbService");

const router = express.Router();

router.get("/search/movie", async (req, res, next) => {
  try {
    const { query, page, language } = req.query;
    if (!query)
      return res.status(400).json({ error: "parametro de query é obrigatório" });
    const data = await tmdbService.searchMovies(query, page, language);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/search/tv", async (req, res, next) => {
  try {
    const { query, page, language } = req.query;
    if (!query)
      return res.status(400).json({ error: "parametro de query é obrigatório" });
    const data = await tmdbService.searchTV(query, page, language);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/search/multi", async (req, res, next) => {
  try {
    const { query, page, language } = req.query;
    if (!query)
      return res.status(400).json({ error: "parametro de query é obrigatório" });
    const data = await tmdbService.searchMulti(query, page, language);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/movie/:tmdbId", async (req, res, next) => {
  try {
    const data = await tmdbService.getMovieDetails(
      req.params.tmdbId,
      req.query.language,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/tv/:tmdbId", async (req, res, next) => {
  try {
    const data = await tmdbService.getTVDetails(
      req.params.tmdbId,
      req.query.language,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/trending/:mediaType/:timeWindow", async (req, res, next) => {
  try {
    const data = await tmdbService.getTrending(
      req.params.mediaType,
      req.params.timeWindow,
      req.query.page,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/movie/popular", async (req, res, next) => {
  try {
    const data = await tmdbService.getPopularMovies(
      req.query.page,
      req.query.language,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/tv/popular", async (req, res, next) => {
  try {
    const data = await tmdbService.getPopularTV(
      req.query.page,
      req.query.language,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/movie/top_rated", async (req, res, next) => {
  try {
    const data = await tmdbService.getTopRatedMovies(
      req.query.page,
      req.query.language,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/tv/top_rated", async (req, res, next) => {
  try {
    const data = await tmdbService.getTopRatedTV(
      req.query.page,
      req.query.language,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/movie/now_playing", async (req, res, next) => {
  try {
    const data = await tmdbService.getNowPlayingMovies(
      req.query.page,
      req.query.language,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/movie/upcoming", async (req, res, next) => {
  try {
    const data = await tmdbService.getUpcomingMovies(
      req.query.page,
      req.query.language,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/genres/movie", async (req, res, next) => {
  try {
    const data = await tmdbService.getMovieGenres(req.query.language);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/genres/tv", async (req, res, next) => {
  try {
    const data = await tmdbService.getTVGenres(req.query.language);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/discover/movie", async (req, res, next) => {
  try {
    const data = await tmdbService.discoverMovies(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/discover/tv", async (req, res, next) => {
  try {
    const data = await tmdbService.discoverTV(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;