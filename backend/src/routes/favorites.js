const express = require("express");
const { Favorite, Movie } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { user_id: req.user.id },
      include: [{ model: Movie }],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      results: rows.map((f) => f.Movie),
      page,
      total_pages: Math.ceil(count / limit),
      total_results: count,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:movieId", authenticate, async (req, res, next) => {
  try {
    const movie = await Movie.findByPk(req.params.movieId);
    if (!movie) return res.status(404).json({ error: "Filme não encontrado" });

    const existing = await Favorite.findOne({
      where: { user_id: req.user.id, movie_id: movie.id },
    });
    if (existing)
      return res.status(409).json({ error: "Já está nos favoritos" });

    await Favorite.create({ user_id: req.user.id, movie_id: movie.id });
    res.status(201).json({ message: "Adicionado aos favoritos", movie });
  } catch (err) {
    next(err);
  }
});

router.delete("/:movieId", authenticate, async (req, res, next) => {
  try {
    const deleted = await Favorite.destroy({
      where: { user_id: req.user.id, movie_id: req.params.movieId },
    });
    if (!deleted) return res.status(404).json({ error: "Não está nos favoritos" });
    res.json({ message: "Removido dos favoritos" });
  } catch (err) {
    next(err);
  }
});

router.get("/check/:movieId", authenticate, async (req, res, next) => {
  try {
    const fav = await Favorite.findOne({
      where: { user_id: req.user.id, movie_id: req.params.movieId },
    });
    res.json({ isFavorite: !!fav });
  } catch (err) {
    next(err);
  }
});

module.exports = router;